import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import peac from "../../Assests/images/peac.png"; // Import the chat icon

const Chatbot = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en-US"); // Default to English
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const socketUrl =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_SOCKET_URL || "https://everydayethiopia-backend.onrender.com"
      : "http://localhost:8000";

  useEffect(() => {
    if (!isAuthenticated) return;

    const initializeChat = async () => {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v2/ai-chat/create-ai-chat`,
          { userId: user._id },
          { withCredentials: true }
        );

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v2/ai-chat/get-ai-chat/${user._id}`,
          { withCredentials: true }
        );

        const welcomeMessage = {
          sender: "AI Chatbot",
          message: language === "am" ? "ዛሬ እንዴት ልረዳዎት እችላለሁ?" : "How can I assist you today?",
          timestamp: new Date(),
          type: "text",
          language,
        };

        setMessages([
          ...data.messages.map((msg) => ({
            sender: msg.sender === "user" ? "You" : "AI Chatbot",
            message: msg.text,
            timestamp: msg.timestamp,
            type: "text",
            language: msg.language || "en-US",
          })),
          welcomeMessage,
        ]);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("");
      } 
    };
    initializeChat();
  }, [isAuthenticated, user, language]);

  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("Connecting to socket:", socketUrl);
    socket.current = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.emit("addUser", user._id);

    socket.current.on("receiveAIChatMessage", (message) => {
      console.log("Received AI message:", message);
      setMessages((prev) => [...prev, { ...message, type: message.type || "text" }]);
      setIsTyping(false);
    });

    socket.current.on("error", ({ message }) => {
      console.error("Socket error:", message);
      setError(message);
    });

    socket.current.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setError("Connection lost. Reconnecting...");
    });

    socket.current.on("connect", () => {
      console.log("Socket connected");
      setError(null);
    });

    socket.current.on("userTyping", ({ userId: typingUserId }) => {
      if (typingUserId === user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1000);
      }
    });

    return () => socket.current.disconnect();
  }, [isAuthenticated, user, socketUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "You", message: input, timestamp: new Date(), type: "text", language };
    setMessages((prev) => [...prev, userMessage]);

    try {
      console.log("Sending message:", input, "Language:", language);
      socket.current.emit("typing", { userId: user._id });
      socket.current.emit("sendAIChatMessage", { userId: user._id, message: input, language });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <style>
        {`
          @keyframes jump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .jump-animation {
            animation: jump 1.5s ease-in-out infinite;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .welcome-text {
            animation: fadeIn 0.5s ease-in-out;
            background-color: white;
            padding: 8px 12px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: #1c3b3e;
            font-size: 0.875rem;
            line-height: 1.25rem;
            max-width: 200px;
            text-align: center;
          }
        `}
      </style>
      {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
      {!isOpen && (
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-[#b38b00] transition-transform duration-200 jump-animation"
          >
            <img src={peac} alt="Chat Icon" className="w-30 h-30 object-contain" />
          </button>
          <span
            className="welcome-text"
            style={{ fontFamily: language === "am" ? "Noto Sans Ethiopic, sans-serif" : "inherit" }}
          >
            {language === "am" ? "ዛሬ እንዴት ልረዳዎት እችላለሁ?" : "How can I assist you today?"}
          </span>
        </div>
      )}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-80 sm:w-96 h-[28rem] flex flex-col">
          <div className="bg-[#1c3b3e] text-white p-4 rounded-t-xl flex justify-between items-center">
            <span className="font-semibold">Peacock Chatbot</span>
            <div className="flex items-center space-x-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#CC9A00] text-white rounded-md p-1 text-sm focus:outline-none"
              >
                <option value="en-US">English</option>
                <option value="am">Amharic</option>
              </select>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#CC9A00]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-3 ${msg.sender === "You" ? "text-right" : "text-left"}`}>
                {msg.type === "text" ? (
                  <span
                    className={`inline-block p-3 rounded-lg ${
                      msg.sender === "You"
                        ? "bg-[#CC9A00] text-white"
                        : "bg-white text-[#1c3b3e] shadow-sm"
                    } max-w-[80%] break-words`}
                    style={{ fontFamily: msg.language === "am" ? "Noto Sans Ethiopic, sans-serif" : "inherit" }}
                  >
                    {msg.message}
                  </span>
                ) : (
                  <img src={msg.message} alt="Response" className="max-w-[80%] rounded-lg" />
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-gray-500 text-xs">peacock is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === "am" ? "መልእክት ይፃፉ..." : "Type a message..."}
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#CC9A00]"
                style={{ fontFamily: language === "am" ? "Noto Sans Ethiopic, sans-serif" : "inherit" }}
              />
              <button
                type="submit"
                className="bg-[#1c3b3e] text-white p-2 rounded-r-lg hover:bg-[#2a5a5e] transition-colors"
              >
                {language === "am" ? "ላክ" : "Send"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;