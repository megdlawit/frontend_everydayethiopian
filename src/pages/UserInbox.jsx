import React, { useEffect, useRef, useState } from "react";
import Header2 from "../components/Layout/Header2";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { server, backend_url } from "../server";
import api from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend, AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import styles from "../styles/styles";

const ENDPOINT = backend_url.replace(/\/$/, "");
const socketId = socketIO(ENDPOINT, { transports: ["websocket"], withCredentials: true });

const UserInbox = () => {
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
  const [active, setActive] = useState(user?.role === "Admin" ? 13 : 4);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAdmin = user?.role === "Admin" || user?._id === process.env.REACT_APP_ADMIN_ID;

  useEffect(() => {
    socketId.on("connect", () => {
      console.log("Socket connected:", socketId.id);
      if (user?._id) {
        socketId.emit("addUser", user._id);
        console.log("Emitted addUser:", user._id);
      }
    });

    socketId.on("reconnect", () => {
      console.log("Socket reconnected:", socketId.id);
      if (user?._id) {
        socketId.emit("addUser", user._id);
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
        _id: Date.now().toString(),
        sender: data.senderId,
        text: data.text,
        images: data.images || null,
        url: data.images?.url || null,
        createdAt: data.createdAt,
        seen: data.seen || false,
      });
    });

    socketId.on("getLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {
      console.log("Received last message update:", { lastMessage, lastMessageId, conversationId });
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage, lastMessageId, updatedAt: Date.now() }
            : conv
        )
      );
    });

    return () => {
      socketId.off("connect");
      socketId.off("reconnect");
      socketId.off("connect_error");
      socketId.off("getUsers");
      socketId.off("getMessage");
      socketId.off("getLastMessage");
    };
  }, [user?._id]);

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      if (currentChat?._id && user?._id) {
        try {
          await api.put(
            `${server}/message/mark-messages-seen/${currentChat._id}`,
            { userId: user._id },
            { withCredentials: true }
          );
          // Optimistically update the seen status in the frontend state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.conversationId === currentChat._id && msg.sender !== user._id && !msg.seen
                ? { ...msg, seen: true }
                : msg
            )
          );
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      }
    };
    markMessagesAsSeen();
  }, [currentChat, user?._id]);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
      // If the current chat is active and a new message arrives, mark it as seen immediately
      if (arrivalMessage.sender !== user._id) {
        api.put(
          `${server}/message/mark-messages-seen/${currentChat._id}`,
          { userId: user._id },
          { withCredentials: true }
        ).catch(err => console.error("Error marking new arrival message as seen:", err));
      }
    }
  }, [arrivalMessage, currentChat, user?._id]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        if (!user?._id) {
          throw new Error("User ID is not available");
        }
        const endpoint = `${server}/conversation/get-all-conversation-user/${user._id}`;
        console.log("Fetching conversations from:", endpoint);
        const response = await api.get(endpoint, { withCredentials: true });
        console.log("Conversations response:", response.data);
        setConversations(response.data.conversations || []);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching conversations:", error.response?.data || error.message);
        setConversations([]);
        setErrorMessage(`Failed to load conversations: ${error.response?.data?.message || error.message}. Please try again.`);
      }
    };
    if (user) getConversation();
  }, [user]);

  useEffect(() => {
    const handleConversationFromUrl = async () => {
      const conversationId = searchParams.get("conversationId");
      if (conversationId && user?._id && conversations.length > 0) {
        const existingChat = conversations.find((conv) => conv._id === conversationId);
        if (existingChat) {
          setCurrentChat(existingChat);
          setOpen(true);
          setIsMobileChatOpen(true);
          const userId = existingChat.members.find((member) => member !== user._id);
          try {
            const res = await api.get(`${server}/conversation/get-account-info/${userId}`, {
              withCredentials: true,
            });
            setUserData(res.data.account);
            await api.put(
              `${server}/message/mark-messages-seen/${conversationId}`,
              { userId: user._id },
              { withCredentials: true }
            );
            setMessages((prev) =>
              prev.map((msg) =>
                msg.sender !== user._id && !msg.seen ? { ...msg, seen: true } : msg
              )
            );
          } catch (error) {
            console.error(`Error fetching account info for userId ${userId}:`, error.response?.data || error.message);
            setErrorMessage("Failed to load user details.");
          }
        } else {
          try {
            const response = await api.get(
              `${server}/conversation/get-conversation/${conversationId}`,
              { withCredentials: true }
            );
            const newChat = response.data.conversation;
            if (newChat) {
              setConversations((prev) => [...prev, newChat]);
              setCurrentChat(newChat);
              setOpen(true);
              setIsMobileChatOpen(true);
              const userId = newChat.members.find((member) => member !== user._id);
              try {
                const res = await api.get(`${server}/conversation/get-account-info/${userId}`, {
                  withCredentials: true,
                });
                setUserData(res.data.account);
                await api.put(
                  `${server}/message/mark-messages-seen/${conversationId}`,
                  { userId: user._id },
                  { withCredentials: true }
                );
              } catch (error) {
                console.error(`Error fetching account info for userId ${userId}:`, error.response?.data || error.message);
              }
            }
          } catch (error) {
            console.error("Error fetching new conversation:", error.response?.data || error.message);
            setErrorMessage("Failed to load the selected conversation. It may not exist or you lack access.");
          }
        }
      }
    };
    handleConversationFromUrl();
  }, [searchParams, conversations.length, user?._id]);

  useEffect(() => {
    const getMessage = async () => {
      try {
        if (!currentChat?._id) {
          throw new Error("Current chat ID is not available");
        }
        const response = await api.get(
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
      setErrorMessage("User or conversation not selected. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append("sender", user._id);
    formData.append("conversationId", currentChat._id);
    formData.append("text", newMessage);
    if (images) {
      formData.append("image", images);
    }

    const receiverId = currentChat.members.find((member) => member !== user._id);

    try {
      const response = await api.post(
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
        createdAt: Date.now(),
        seen: false,
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
            ? { ...conv, lastMessage: newMessage || "Photo", lastMessageId: user._id, updatedAt: Date.now() }
            : conv
        )
      );

      setNewMessage("");
      setImages(null);
      setErrorMessage("");
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
      setErrorMessage(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) {
      setErrorMessage("No file selected.");
      return;
    }

    if (!file.type.startsWith("image/") || file.size > 50 * 1024 * 1024) {
      setErrorMessage("Invalid file: must be an image under 50MB.");
      return;
    }

    if (!user?._id || !currentChat?._id) {
      setErrorMessage("User or conversation not selected.");
      return;
    }

    setUploading(true);
    setImages(file);

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: user._id,
      conversationId: currentChat._id,
      text: "",
      images: { url: URL.createObjectURL(file), tempId },
      createdAt: Date.now(),
      seen: false,
    };
    setMessages((prev) => [...prev, tempMessage]);

    const formData = new FormData();
    formData.append("sender", user._id);
    formData.append("conversationId", currentChat._id);
    formData.append("text", "");
    formData.append("image", file);

    const receiverId = currentChat.members.find((member) => member !== user._id);

    try {
      const response = await api.post(
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
        createdAt: Date.now(),
        seen: false,
      });

      socketId.emit("updateLastMessage", {
        lastMessage: "Photo",
        lastMessageId: user._id,
        conversationId: currentChat._id,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...message, seen: false } : msg
        )
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === currentChat._id
            ? { ...conv, lastMessage: "Photo", lastMessageId: user._id, updatedAt: Date.now() }
            : conv
        )
      );

      setErrorMessage("");
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      setErrorMessage(`Failed to upload image: ${error.response?.data?.message || error.message}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    } finally {
      setImages(null);
      setUploading(false);
      e.target.value = null;
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMobileChatClose = () => {
    setIsMobileChatOpen(false);
    setOpen(false);
    setCurrentChat(null);
    navigate('/inbox', { replace: true });
  };

  const handleChatSelect = (conversation) => {
    setCurrentChat(conversation);
    setOpen(true);
    setIsMobileChatOpen(true);
  };

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header2 />
      
      {/* Mobile Header for Chat View */}
      {isMobileChatOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 p-4 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={handleMobileChatClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AiOutlineArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Messages</h1>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </div>
      )}

      <div className={`${styles.section} flex bg-[#fff] py-0 pt-16 lg:pt-0`}>
        <div className="w-[50px] 800px:w-[335px] sticky top-0 h-screen hidden 800px:block">
          {isAdmin ? (
            <AdminSideBar active={active} isOpen={true} onClose={() => {}} />
          ) : (
            <ProfileSidebar active={active} setActive={setActive} />
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex flex-col lg:flex-row">
          {/* Conversations List - Always visible on desktop, conditionally on mobile */}
          <div className={`w-full lg:w-[400px] h-[calc(100vh-80px)] overflow-y-auto bg-white text-[#1C3B3E] lg:border-r border-gray-200 ${
            isMobileChatOpen ? 'hidden lg:block' : 'block'
          }`}>
            {errorMessage && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
                {errorMessage}
              </div>
            )}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">All Messages</h3>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-sm"
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
                    setCurrentChat={handleChatSelect}
                    me={user._id}
                    setUserData={setUserData}
                    userData={userData}
                    online={onlineCheck(item)}
                    setActiveStatus={setActiveStatus}
                    loading={loading}
                    searchTerm={searchTerm}
                    isSelected={currentChat?._id === item._id}
                    messages={messages}
                    isMobileChatOpen={isMobileChatOpen}
                  />
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-gray-600">
                    {errorMessage ? errorMessage : "No conversations found. Create a new chat to start messaging."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - Desktop */}
          <div className="w-full lg:flex-1 bg-white text-[#1C3B3E] hidden lg:block">
            {open && currentChat ? (
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
                images={images}
                setImages={setImages}
                isMobile={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-gray-600 p-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AiOutlineSend size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to Messages</h3>
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Area - Mobile (Full Screen) */}
          <div className={`w-full bg-white text-[#1C3B3E] lg:hidden fixed inset-0 z-30 transform transition-transform duration-300 ${
            isMobileChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
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
                images={images}
                setImages={setImages}
                isMobile={true}
                onClose={handleMobileChatClose}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="lg:hidden h-16"></div>
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
  isSelected,
  messages,
  isMobileChatOpen,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleClick = (id) => {
    setCurrentChat(data);
    setUserData(user);
    setActiveStatus(online);
    navigate(`/inbox?conversationId=${id}`, { replace: true });
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((member) => member !== me);
    const getUser = async () => {
      try {
        const res = await api.get(`${server}/conversation/get-account-info/${userId}`, {
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
      let imageUrl;
      const firstImage = images[0];
      if (typeof firstImage === "string") {
        imageUrl = firstImage.startsWith("http") || firstImage.startsWith("/uploads/")
          ? firstImage
          : `${backend_url}/uploads/${firstImage.split("/").pop()}`;
      } else if (firstImage?.url || firstImage?.public_id) {
        imageUrl = firstImage.url?.startsWith("http") || firstImage.url?.startsWith("/uploads/")
          ? firstImage.url
          : `${backend_url}/uploads/${firstImage.public_id || firstImage.url?.split("/").pop()}`;
      }
      if (imageUrl) {
        return imageUrl;
      }
    }
    return `${backend_url}/uploads/messages/placeholder.png`;
  };

  const unseenCount = messages.filter(
    (msg) => msg.conversationId === data._id && msg.sender !== me && !msg.seen
  ).length;

  const showItem = !searchTerm || 
    data?.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    data?.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());

  if (!showItem) return null;

  return (
    <div
      className={`w-full flex p-4 ${
        isSelected ? "bg-yellow-50 border-r-2 border-[#CC9A00]" : "bg-transparent"
      } cursor-pointer hover:bg-yellow-50 transition-all duration-200 border-b border-gray-100`}
      onClick={() => handleClick(data._id)}
    >
      <div className="relative flex-shrink-0">
        <img
          src={getProductImageSrc(data.images)}
          alt={data.groupTitle || "Conversation"}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `${backend_url}/uploads/messages/placeholder.png`;
          }}
        />
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="flex-1 pl-3 flex flex-col justify-center min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {data.groupTitle || "Conversation"}
          </h1>
          {unseenCount > 0 && (
            <span className="bg-[#CC9A00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
              {unseenCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {!loading && data?.lastMessageId !== user?._id
            ? "You: "
            : (user?.name?.split(" ")[0] || "User") + ": "}
          {data?.lastMessage || "No messages yet"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {data.updatedAt ? format(data.updatedAt) : ""}
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
  images,
  setImages,
  isMobile = false,
  onClose,
}) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (userData?.avatar?.url) {
      const baseUrl = backend_url.replace(/\/$/, "");
      const normalized = userData.avatar.url.replace(/\\/g, "/").replace(/\/Uploads\//i, "/uploads/");
      const avatarPath = normalized.startsWith("http") ? normalized : `${baseUrl}${normalized}`;
      setAvatarUrl(avatarPath);
    } else {
      setAvatarUrl(`${backend_url}/uploads/messages/placeholder.png`);
    }
  }, [userData]);

  const getMessageImageSrc = (image) => {
    if (image) {
      let imageUrl;
      if (typeof image === "string") {
        imageUrl = image.startsWith("http") || image.startsWith("/uploads/")
          ? image
          : `${backend_url}/uploads/messages/${image.split("/").pop()}`;
      } else if (image.url || image.public_id) {
        imageUrl = image.url?.startsWith("http") || image.url?.startsWith("/uploads/")
          ? image.url
          : `${backend_url}/uploads/messages/${image.public_id || image.url?.split("/").pop()}`;
      }
      if (imageUrl) {
        return imageUrl;
      }
    }
    return `${backend_url}/uploads/messages/placeholder.png`;
  };

  const getConversationImageSrc = (images) => {
    if (images && images.length > 0) {
      let imageUrl;
      const firstImage = images[0];
      if (typeof firstImage === "string") {
        imageUrl = firstImage.startsWith("http") || firstImage.startsWith("/uploads/")
          ? firstImage
          : `${backend_url}/uploads/${firstImage.split("/").pop()}`;
      } else if (firstImage?.url || firstImage?.public_id) {
        imageUrl = firstImage.url?.startsWith("http") || firstImage.url?.startsWith("/uploads/")
          ? firstImage.url
          : `${backend_url}/uploads/${firstImage.public_id || firstImage.url?.split("/").pop()}`;
      }
      if (imageUrl) {
        return imageUrl;
      }
    }
    return `${backend_url}/uploads/messages/placeholder.png`;
  };

  const conversationImage = getConversationImageSrc(currentChat?.images);
  const conversationTitle = currentChat?.groupTitle || "Conversation";
  const conversationPrice = currentChat?.groupTitle?.match(/\d+\.?\d*\s*Birr/)?.[0] || "No price available";

  return (
    <div className={`w-full ${isMobile ? 'h-screen' : 'h-[calc(100vh-80px)]'} flex flex-col bg-white`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
          >
            <AiOutlineArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <img
          src={conversationImage}
          alt="Product"
          className="w-12 h-12 rounded-lg object-cover mr-3"
          onError={(e) => {
            e.target.src = `${backend_url}/uploads/messages/placeholder.png`;
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {conversationTitle.split(" - ")[0]}
          </h2>
          <p className="text-xs text-gray-500 truncate">{conversationPrice}</p>
        </div>
        <div className="flex items-center ml-2">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={userData?.name || "User"}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `${backend_url}/uploads/messages/placeholder.png`;
              }}
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              activeStatus ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="ml-2 hidden sm:block">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[80px]">
              {userData?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {activeStatus ? "Active" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <div
              key={item._id || index}
              className={`flex ${item.sender === sellerId ? "justify-end" : "justify-start"}`}
              ref={index === messages.length - 1 ? scrollRef : null}
            >
              {item.sender !== sellerId && (
                <img
                  src={avatarUrl}
                  className="w-8 h-8 rounded-full mr-2 self-end flex-shrink-0"
                  alt="Avatar"
                  onError={(e) => {
                    e.target.src = `${backend_url}/uploads/messages/placeholder.png`;
                  }}
                />
              )}
              <div className="max-w-xs lg:max-w-md">
                {item.images?.url && (
                  <img
                    src={getMessageImageSrc(item.images)}
                    className="w-full max-w-xs rounded-lg mb-2"
                    alt="Message image"
                    onError={(e) => {
                      e.target.src = `${backend_url}/uploads/messages/placeholder.png`;
                    }}
                  />
                )}
                {item.text && (
                  <div
                    className={`p-3 rounded-lg ${
                      item.sender === sellerId 
                        ? "bg-[#1C3B3E] text-white rounded-br-none" 
                        : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    <p className="text-sm break-words">{item.text}</p>
                    <p className={`text-xs mt-1 ${
                      item.sender === sellerId ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {format(item.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <AiOutlineSend size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
        {uploading && (
          <div className="flex justify-end">
            <div className="w-8 h-8 border-2 border-[#CC9A00] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessageHandler}
        className="p-4 bg-white border-t border-gray-200 flex items-center space-x-2"
      >
        <div className="flex-shrink-0">
          <input
            type="file"
            name="image"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          <label htmlFor="image" className="cursor-pointer">
            <TfiGallery
              className={`text-gray-500 hover:text-[#1C3B3E] transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              size={20}
            />
          </label>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-3 pr-12 rounded-full bg-gray-100 text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-sm"
            disabled={uploading}
          />
        </div>
        <button
          type="submit"
          disabled={(!newMessage.trim() && !images) || uploading}
          className="bg-[#CC9A00] text-white p-3 rounded-full hover:bg-[#1C3B3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <AiOutlineSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default UserInbox;