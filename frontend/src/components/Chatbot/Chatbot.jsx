import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./Message";
import MessageInput from "./MessageInput";
import CloseButton from "./CloseButton";
import API from "../../services/api"; 
import ViewIdeas from "./ViewIdeas";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [currentKey, setCurrentKey] = useState("");
  const [options, setOptions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken"); 


  useEffect(() => {
    const startConversation = async () => {
      try {
        const res = await API.post("/api/start/", {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

    setMessages((prev) => [...prev, { sender: "user", text: message }]);

    try {
      const res = await API.post("/api/respond/", {
        conversation_id: conversationId,
        user_input: message.trim(),
        next_key: currentKey,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.is_complete) {
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.ai_response }]);
        setIsComplete(true);
      } else {
        setCurrentKey(res.data.next_key);
        setOptions(res.data.options || []);
        setMessages((prev) => [...prev, { sender: "bot", text: res.data.ai_response }]);
      }
    } catch (err) {
      console.error("Failed to respond:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Failed to submit response." }]);
    }
  };

  const handleClear = () => {
    setMessages([{ sender: "bot", text: "Chat cleared. How can I help now?" }]);
    setConversationId(null);
    setCurrentKey("");
    setOptions([]);
    setIsComplete(false);
  };

  const handleLogout = () => {
    alert("Logging out...");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`relative min-h-screen flex justify-center items-center transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-teal-100 text-black"}`}>
      <CloseButton />
      <ViewIdeas/>
      <div className={`flex flex-col w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 h-[85vh] rounded-2xl overflow-hidden shadow-2xl border ${darkMode ? "border-gray-700 bg-black" : "border-teal-200 bg-white"}`}>
        <div className={`flex justify-between items-center px-6 py-3 shadow-md ${darkMode ? "bg-teal-900 text-white" : "bg-teal-600 text-white"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-teal-700 font-bold rounded-lg flex items-center justify-center">A</div>
            <h3 className="text-lg font-semibold">Aideator</h3>
          </div>
          <div className="flex items-center gap-3 relative">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode((d) => !d)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-teal-500 transition-colors duration-300"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        <div className={`flex-1 flex flex-col gap-3 overflow-y-auto p-5 ${darkMode ? "bg-gray-800" : "bg-teal-50"}`}>
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
  );
};

export default Chatbot;
