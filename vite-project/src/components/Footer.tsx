import React from 'react';
import { useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  
  // Only show footer on main page
  if (location.pathname !== '/') {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center border-t border-[#ffa500] bg-black/30 backdrop-blur-sm z-40">
      <p className="text-sm text-white">© 2025 Conceal Network. All rights reserved.</p>
    </footer>
  );
}