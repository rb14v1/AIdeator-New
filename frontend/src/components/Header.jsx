import React from "react";
import version1 from "../assets/version1.png";
 
export default function Header() {
  return (
    <header className="w-full bg-transparent py-6">
      <div className="w-full flex items-center justify-start px-6">
        <img
          src={version1}
          alt="V1 Logo"
          className="h-10 w-auto object-contain cursor-pointer"
        />
      </div>
    </header>
  );
}
 
 