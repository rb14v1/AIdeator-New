import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Header */}
      <header className="w-full bg-teal-600 text-white flex justify-between items-center px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-teal-600 rounded-lg flex justify-center items-center text-xl font-bold shadow">
            A
          </div>
          <h2 className="text-2xl font-semibold tracking-wide">Aideator Admin</h2>
        </div>

        {/* Profile Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-full font-medium shadow hover:bg-teal-50 transition">
            <span>Admin</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 transition-all duration-300 transform ${
              showDropdown
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-2 invisible"
            }`}
          >
            <button
              onClick={() => navigate("/history")}
              className="block w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors"
            >
              Admin History
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="block w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors"
            >
              Dashboard
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Main content area */}
      <main className="flex flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
};

export default AdminLayout;
