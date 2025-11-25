import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
import MessageInput from "./MessageInput";
import API from "../../services/api";
import ViewIdeas from "./ViewIdeas";
import Footer from "../Footer";
import Header from "../Header";
 
const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [currentKey, setCurrentKey] = useState("");
  const [options, setOptions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
 
  useEffect(() => {
    const startConversation = async () => {
      try {
        const res = await API.post(
          "/start/",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
 
        setConversationId(res.data.conversation_id);
        setCurrentKey(res.data.next_key);
        setOptions(res.data.options || []);
        setMessages([
          { sender: "bot", text: res.data.message },
          { sender: "bot", text: res.data.ai_response }
        ]);
      } catch (err) {
        console.error("Failed to start conversation:", err);
        setMessages([{ sender: "bot", text: "⚠️ Could not start conversation." }]);
      }
    };
 
    startConversation();
  }, [token]);
 
  const handleSend = async (message) => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: message }]);
 
    try {
      const res = await API.post(
        "/respond/",
        {
          conversation_id: conversationId,
          user_input: message.trim(),
          next_key: currentKey,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      if (res.data.is_complete) {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: res.data.ai_response }
        ]);
        setIsComplete(true);
      } else {
        setCurrentKey(res.data.next_key);
        setOptions(res.data.options || []);
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: res.data.ai_response }
        ]);
      }
    } catch (err) {
      console.error("Failed to respond:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "❌ Failed to submit response." }
      ]);
    }
  };
 
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };
 
  return (
    <div
      className={`min-h-screen overflow-hidden flex flex-col transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-teal-100 text-black"
        }`}
    >
      <Header
        handleLogout={handleLogout}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="mt-20 px-6 flex justify-end gap-3">
        <ViewIdeas />
      </div>
      <div className="flex flex-col items-center flex-1 px-4 pb-4">
        <div
          className={`flex flex-col w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2
            h-[65vh] rounded-2xl overflow-hidden shadow-2xl border
            ${darkMode ? "border-gray-700 bg-black" : "border-teal-200 bg-white"}`}
        >
          <div
            className={`flex justify-between items-center px-6 py-3 shadow-md ${darkMode ? "bg-teal-900 text-white" : "bg-teal-600 text-white"
              }`}
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Aideator</h3>
            </div>
          </div>
 
          <div
            className={`flex-1 overflow-x-hidden flex flex-col gap-3 overflow-y-hidden p-5 ${darkMode ? "bg-gray-800" : "bg-teal-50"
              }`}
          >
            {messages.map((msg, i) => (
              <Message key={i} sender={msg.sender} text={msg.text} darkMode={darkMode} />
            ))}
 
            {options.length > 0 && !isComplete && (
              <div className="flex flex-col gap-2 mt-2">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(opt)}
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {options.length === 0 && !isComplete && (
            <MessageInput onSend={handleSend} darkMode={darkMode} />
          )}
        </div>
      </div>
 
      <Footer />
    </div>
  );
};
 
export default Chatbot;
 
 