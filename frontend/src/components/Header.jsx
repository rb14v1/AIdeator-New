import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import version1 from "../assets/version1.png";
 
export default function Header({
  onToggleSidebar,
  showProfileMenu,
  setShowProfileMenu,
  handleLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
 
  const username = localStorage.getItem("username");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
 
  const profileLetter = isAdmin
    ? "A"
    : username
      ? username.trim().charAt(0).toUpperCase()
      : "U";
 
  const isLoginPage = location.pathname === "/login";
 
  return (
    <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200 z-[1000]">
      <div className="flex items-center justify-between px-6 py-3">
 
        {/* Hamburger */}
        {!isLoginPage && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
 
        {/* Logo */}
        <img
          src={version1}
          alt="V1 Logo"
          className="h-8 w-auto cursor-pointer"
          onClick={() => navigate(isLoginPage ? "/login" : "/")}
        />
 
        {/* Profile */}
        {!isLoginPage && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center
          text-white font-semibold text-base hover:opacity-90 transition cursor-pointer "
            >
              {profileLetter}
            </button>
 
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border shadow-md rounded-md py-2 z-[9999]">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer block w-full text-left text-sm px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
 
  );
}
 
 