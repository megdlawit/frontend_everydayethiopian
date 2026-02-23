import React, { useEffect, useRef, useState } from "react";
import Header2 from "../../components/Layout/Header2";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { server, backend_url } from "../../server";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import ProfileSidebar from "../../components/Profile/ProfileSidebar";
import styles from "../../styles/styles";

const ENDPOINT = backend_url.replace(/\/$/, "");
const socketId = socketIO(ENDPOINT, { transports: ["websocket"], withCredentials: true });

const DashboardMessages = () => {
  const { user, loading } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [images, setImages] = useState(null);
  const [active, setActive] = useState(4); // Set to 4 for Inbox
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use admin ID from environment variable
  const adminId = process.env.REACT_APP_ADMIN_ID;

  useEffect(() => {
    socketId.on("connect", () => {
      console.log("Socket connected:", socketId.id);
      if (user?._id) {
        socketId.emit("addUser", user._id);
        console.log("Emitted addUser:", user._id);
      }
    });

    socketId.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setErrorMessage("Socket connection failed. Please refresh the page.");
    });

    socketId.on("getUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    socketId.on("getMessage", (data) => {
      console.log("Received message:", data);
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        images: data.images || null,
        url: data.images?.url || null,
        createdAt: data.createdAt,
      });
    });

    socketId.on("getLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {
      console.log("Received last message update:", { lastMessage, lastMessageId, conversationId });
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage, lastMessageId }
            : conv
        )
      );
    });

    return () => {
      socketId.off("connect");
      socketId.off("connect_error");
      socketId.off("getUsers");
      socketId.off("getMessage");
      socketId.off("getLastMessage");
    };
  }, [user?._id]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        if (!user?._id) {
          throw new Error("User ID is not available");
        }
        // Use admin-specific endpoint for conversation retrieval
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-admin/${user._id}`,
          { withCredentials: true }
        );
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error("Error fetching conversations:", error.response?.data || error.message);
        setConversations([]);
        setErrorMessage("Failed to load conversations. Please try again.");
      }
    };
    if (user) getConversation();
  }, [user]);

  useEffect(() => {
    const handleConversationFromUrl = async () => {
      const conversationId = searchParams.get("conversationId");
      if (conversationId && user?._id) {
        const existingChat = conversations.find((conv) => conv._id === conversationId);
        if (existingChat) {
          setCurrentChat(existingChat);
          setOpen(true);
          const userId = existingChat.members.find((member) => member !== user._id);
          const getUser = async () => {
            try {
              const res = await axios.get(`${server}/conversation/get-account-info/${userId}`, {
                withCredentials: true,
              });
              setUserData(res.data.account);
            } catch (error) {
              console.error(`Error fetching account info for userId ${userId}:`, error.response?.data || error.message);
            }
          };
          getUser();
        } else {
          try {
            const response = await axios.get(
              `${server}/conversation/get-conversation/${conversationId}`,
              { withCredentials: true }
            );
            const newChat = response.data.conversation;
            setConversations((prev) => [...prev, newChat]);
            setCurrentChat(newChat);
            setOpen(true);
            const userId = newChat.members.find((member) => member !== user._id);
            const getUser = async () => {
              try {
                const res = await axios.get(`${server}/conversation/get-account-info/${userId}`, {
                  withCredentials: true,
                });
                setUserData(res.data.account);
              } catch (error) {
                console.error(`Error fetching account info for userId ${userId}:`, error.response?.data || error.message);
              }
            };
            getUser();
          } catch (error) {
            console.error("Error fetching new conversation:", error.response?.data || error.message);
            setErrorMessage("Failed to load the selected conversation.");
          }
        }
      }
    };
    handleConversationFromUrl();
  }, [searchParams, conversations, user?._id]);

  useEffect(() => {
    const getMessage = async () => {
      try {
        if (!currentChat?._id) {
          throw new Error("Current chat ID is not available");
        }
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat._id}`,
          { withCredentials: true }
        );
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
        setErrorMessage("Failed to load messages. Please try again.");
      }
    };
    if (currentChat) getMessage();
  }, [currentChat]);

  const onlineCheck = (chat) => {
    if (!chat?.members) return false;
    const chatMembers = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((u) => u.userId === chatMembers);
    return !!online;
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !images) return;

    if (!user?._id || !currentChat?._id) {
      console.error("Missing required data:", { userId: user._id, conversationId: currentChat?._id });
      setErrorMessage("User or conversation not selected. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append("sender", user._id);
    formData.append("conversationId", currentChat._id);
    formData.append("text", newMessage);

    const receiverId = currentChat.members.find((member) => member !== user._id);

    try {
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log("Sending message with FormData:", formDataEntries);

      const response = await axios.post(
        `${server}/message/create-new-message`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          timeout: 10000,
        }
      );
      const message = response.data.message;

      socketId.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: newMessage,
        images: message.images || null,
      });

      socketId.emit("updateLastMessage", {
        lastMessage: newMessage || "Photo",
        lastMessageId: user._id,
        conversationId: currentChat._id,
      });

      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === currentChat._id
            ? { ...conv, lastMessage: newMessage || "Photo", lastMessageId: user._id }
            : conv
        )
      );

      setNewMessage("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error sending message:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setErrorMessage(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?._id || !currentChat?._id) {
      console.error("Missing required data:", {
        file: !!file,
        userId: user._id,
        conversationId: currentChat?._id,
      });
      setErrorMessage("Please select a file and ensure a conversation is active.");
      return;
    }

    if (!file.name || !file.type.startsWith("image/") || file.size > 50 * 1024 * 1024) {
      console.error("Invalid file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setErrorMessage("Invalid file: must be an image under 50MB.");
      return;
    }

    console.log("Image selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });
    setImages(file);
    setUploading(true);

    const tempId = Date.now().toString();
    const tempMessage = {
      sender: user._id,
      conversationId: currentChat._id,
      text: "",
      images: { url: URL.createObjectURL(file), tempId },
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    const formData = new FormData();
    formData.append("sender", user._id);
    formData.append("conversationId", currentChat._id);
    formData.append("text", "");
    formData.append("image", file);

    const receiverId = currentChat.members.find((member) => member !== user._id);

    try {
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log("Uploading image with FormData:", formDataEntries);

      const response = await axios.post(
        `${server}/message/create-new-message`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          timeout: 10000,
        }
      );
      const message = response.data.message;

      socketId.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: "",
        images: message.images || null,
      });

      socketId.emit("updateLastMessage", {
        lastMessage: "Photo",
        lastMessageId: user._id,
        conversationId: currentChat._id,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.images?.tempId === tempId && msg.sender === user._id
            ? message
            : msg
        )
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === currentChat._id
            ? { ...conv, lastMessage: "Photo", lastMessageId: user._id }
            : conv
        )
      );

      setErrorMessage("");
    } catch (error) {
      console.error("Error uploading image:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setErrorMessage(`Failed to upload image: ${error.response?.data?.message || error.message}`);
      setMessages((prev) =>
        prev.filter((msg) => msg.images?.tempId !== tempId)
      );
    } finally {
      setImages(null);
      setUploading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header2 />
      <div className={`${styles.section} flex bg-[#fff] py-0`}>
        <div className="w-[50px] 800px:w-[335px] sticky top-0 h-screen hidden 800px:block">
          <ProfileSidebar active={active} setActive={setActive} />
        </div>
        <div className="w-full flex flex-col 800px:flex-row">
          <div className="w-full 800px:w-[400px] h-[calc(100vh-80px)] overflow-y-auto bg-white text-[#1C3B3E] 800px:border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">All Messages</h3>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#CC9A00]"
              />
            </div>
            <div className="px-0">
              {conversations.length > 0 ? (
                conversations.map((item, index) => (
                  <MessageList
                    data={item}
                    key={index}
                    index={index}
                    setOpen={setOpen}
                    setCurrentChat={setCurrentChat}
                    me={user._id}
                    setUserData={setUserData}
                    userData={userData}
                    online={onlineCheck(item)}
                    setActiveStatus={setActiveStatus}
                    loading={loading}
                    searchTerm={searchTerm}
                  />
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">No conversations found.</p>
              )}
            </div>
          </div>
          <div className="w-full 800px:flex-1 bg-white text-[#1C3B3E] hidden 800px:block">
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 mb-3 rounded-lg text-center">
                {errorMessage}
              </div>
            )}
            {open && currentChat && (
              <SellerInbox
                setOpen={setOpen}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessageHandler={sendMessageHandler}
                messages={messages}
                sellerId={user._id}
                userData={userData}
                activeStatus={onlineCheck(currentChat)}
                scrollRef={scrollRef}
                handleImageUpload={handleImageUpload}
                uploading={uploading}
                currentChat={currentChat}
              />
            ) || (
              <div className="flex items-center justify-center h-[calc(100vh-80px)] text-gray-600">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
          <div className="w-full bg-white text-[#1C3B3E] block 800px:hidden">
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 mb-3 rounded-lg text-center">
                {errorMessage}
              </div>
            )}
            {open && currentChat && (
              <SellerInbox
                setOpen={setOpen}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessageHandler={sendMessageHandler}
                messages={messages}
                sellerId={user._id}
                userData={userData}
                activeStatus={onlineCheck(currentChat)}
                scrollRef={scrollRef}
                handleImageUpload={handleImageUpload}
                uploading={uploading}
                currentChat={currentChat}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
  loading,
  searchTerm,
}) => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/inbox?conversationId=${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((member) => member !== me);
    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/conversation/get-account-info/${userId}`, {
          withCredentials: true,
        });
        console.log("Fetched account data:", res.data.account);
        setUser(res.data.account);
      } catch (error) {
        console.error(`Error fetching account info for userId ${userId}:`, error.response?.data || error.message);
      }
    };
    getUser();
  }, [me, data]);

  const getProductImageSrc = (images) => {
    if (images && images.length > 0) {
      const baseUrl = `${backend_url}/Uploads/messages/`;
      const imageUrl = images[0].url || `${baseUrl}${images[0].public_id}`;
      console.log("Product Image URL:", imageUrl);
      return imageUrl;
    }
    return "https://placehold.co/50?text=Product";
  };

  const unreadCount = index === 0 ? 2 : 0; // Demo unread for first conversation

  const showItem = !searchTerm || data?.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || data?.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());

  if (!showItem) return null;

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-yellow-50" : "bg-transparent"
      } cursor-pointer hover:bg-yellow-50 transition-all duration-200 mb-1`}
      onClick={() =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative flex-shrink-0">
        <img
          src={getProductImageSrc(data.images)}
          alt={data.groupTitle || "Product image"}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            console.warn(`Failed to load product image for conversation ${data._id}: ${e.target.src}`);
            e.target.src = "https://placehold.co/50?text=Product";
          }}
        />
        {online ? (
          <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-white" />
        ) : (
          <div className="w-3 h-3 bg-gray-400 rounded-full absolute -bottom-1 -right-1 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 pl-3 flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{data.groupTitle || "Unnamed Product"}</h1>
          {unreadCount > 0 && (
            <span className="bg-[#CC9A00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-1">
          {!loading && data?.lastMessageId !== user?._id
            ? "You: "
            : user?.name?.split(" ")[0] + ": "}
          {data?.lastMessage || ""}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
  uploading,
  currentChat,
}) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (userData?.avatar?.url) {
      const baseUrl = backend_url;
      const normalized = userData.avatar.url.replace(/\\/g, "/").replace(/\/Uploads\//, "/uploads/");
      const avatarPath = userData.avatar.url.startsWith("http") ? userData.avatar.url : `${baseUrl}${normalized}`;
      setAvatarUrl(avatarPath);
    } else {
      setAvatarUrl("https://placehold.co/50?text=User");
    }
  }, [userData]);

  const getMessageImageSrc = (image) => {
    if (image?.url) {
      return image.url.startsWith("http") ? image.url : `${backend_url}${image.url}`;
    }
    return "https://placehold.co/300?text=Image+Not+Found";
  };

  const conversationImage = currentChat?.images[0] || "https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=Sofa";
  const conversationTitle = currentChat?.groupTitle || "Handwoven Habesha Kemis";
  const conversationPrice = currentChat?.groupTitle.match(/\d+\.?\d*\s*Birr/)?.[0] || "Order #1234";

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-white">
      <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
        <img
          src={conversationImage}
          alt="Product"
          className="w-20 h-20 rounded-lg object-cover mr-4"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{conversationTitle.split(" - ")[0]}</h2>
          <p className="text-sm text-gray-500">{conversationPrice}</p>
        </div>
        <div className="flex items-center ml-4">
          <img
            src={avatarUrl || "https://placehold.co/40x40?text=AA"}
            alt={userData?.name || "Customer avatar"}
            className="w-10 h-10 rounded-full object-cover mr-2"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{userData?.name || "Abebech Abebe"}</p>
            <p className="text-xs text-gray-500">{activeStatus ? "Active Now" : "Offline"}</p>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="ml-4 cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={() => setOpen(false)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages &&
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.sender === sellerId ? "justify-end" : "justify-start"}`}
              ref={index === messages.length - 1 ? scrollRef : null}
            >
              {item.sender !== sellerId && (
                <img
                  src={avatarUrl || "https://placehold.co/40x40?text=AA"}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                  alt="Avatar"
                />
              )}
              <div className="max-w-xs lg:max-w-md">
                {item.images?.url && (
                  <img
                    src={getMessageImageSrc(item.images)}
                    className="w-full max-w-xs rounded-lg mb-2"
                    alt="Message image"
                  />
                )}
                {item.text && (
                  <div
                    className={`p-3 rounded-lg ${
                      item.sender === sellerId ? "bg-[#1C3B3E] text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{item.text}</p>
                    <p className={`text-xs mt-1 ${
                      item.sender === sellerId ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {format(item.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        {uploading && (
          <div className="flex justify-end">
            <div className="w-8 h-8 border-2 border-[#CC9A00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <form
        onSubmit={sendMessageHandler}
        className="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-2"
      >
        <div className="w-[30px]">
          <input
            type="file"
            name="image"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          <label htmlFor="image">
            <TfiGallery
              className={`cursor-pointer text-gray-500 hover:text-[#1C3B3E] ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              size={20}
            />
          </label>
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-full bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#CC9A00] pr-12"
          disabled={uploading}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() && !uploading}
          className="bg-[#CC9A00] text-white px-4 py-2 rounded-full hover:bg-[#1C3B3E] transition-colors disabled:opacity-50"
        >
          <AiOutlineSend />
        </button>
      </form>
    </div>
  );
};

export default DashboardMessages;