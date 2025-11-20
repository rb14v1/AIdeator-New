import React from "react";

const Message = ({ sender, text, darkMode }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
    >
      <div
        className={`px-4 py-2 rounded-2xl max-w-[75%] text-base ${
          isUser
            ? "bg-teal-600 text-white"
            : darkMode
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-800"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
