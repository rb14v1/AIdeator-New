import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot/Chatbot"; 

const HomePage = () => {
  const [darkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logging out...");
  };

  const handleAdminHistory = () => {
    navigate("/history");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToChatbot = () => {
    navigate("/admin-chatbot");
  };

  return (
    <div
      className={`relative w-full h-screen flex justify-center items-center transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-teal-100 text-black"
      }`}
    >
      {/* Profile Dropdown */}
      <div
        className="absolute top-0 right-0 group"
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        {/* Profile Icon */}
        <div className="m-4 w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#00796B"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-16 right-4 w-56 bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 transform ${
            showDropdown
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="py-2">
            {/* Admin History */}
            <button
              onClick={handleAdminHistory}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors duration-200 flex items-center gap-3 text-gray-700 hover:text-teal-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Admin History</span>
            </button>

            {/* Go to Dashboard */}
            <button
              onClick={handleGoToDashboard}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors duration-200 flex items-center gap-3 text-gray-700 hover:text-teal-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0H5a2 2 0 01-2-2v-4a2 2 0 012-2h2m6 8h4a2 2 0 002-2v-4a2 2 0 00-2-2h-2"
                />
              </svg>
              <span className="font-medium">Admin Dashboard</span>
            </button>

            {/* Go to Chatbot */}
            <button
              onClick={handleGoToChatbot}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors duration-200 flex items-center gap-3 text-gray-700 hover:text-teal-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8h10M7 12h6m-6 4h10"
                />
              </svg>
              <span className="font-medium">Chatbot</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 text-gray-700 hover:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default HomePage;
