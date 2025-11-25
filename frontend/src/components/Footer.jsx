import React from "react";
 
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500 mt-auto">
      <p>© {new Date().getFullYear()} Aideator. All rights reserved. @Version1</p>
    </footer>
  );
}
