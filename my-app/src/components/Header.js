"use client";

import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">JobFair</div>
      
      <div className="relative">
        <button 
          onClick={toggleMenu}
          className="focus:outline-none"
        >
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Jobs
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Connected Platforms
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Settings
            </a>
          </div>
        )}
      </div>
    </header>
  );
} 