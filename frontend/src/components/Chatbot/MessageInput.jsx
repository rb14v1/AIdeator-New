import React, { useState } from "react";

const MessageInput = ({ onSend, darkMode }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 px-3 py-3 border-t ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={`flex-1 px-4 py-2 text-base rounded-lg outline-none ${
          darkMode
            ? "bg-gray-800 text-white placeholder-gray-400"
            : "bg-teal-50 text-gray-900 placeholder-gray-500"
        }`}
      />
      <button
        type="submit"
        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
