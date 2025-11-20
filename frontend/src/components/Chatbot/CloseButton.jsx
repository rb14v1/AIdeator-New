import React from "react";
import { useNavigate } from "react-router-dom";

const CloseButton = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // Clears all auth tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAdmin");

    navigate("/login");
  };

  return (
    <button
      onClick={handleClose}
      title="Logout and return to Login"
      className="fixed top-4 right-20 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full 
                 flex items-center justify-center shadow-md hover:shadow-lg 
                 transition-all duration-200 z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default CloseButton;
