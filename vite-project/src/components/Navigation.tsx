import React, { useEffect, useState } from 'react';
import { Home, Send, Download, MessageSquare, Plus, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render navigation on main page
  if (location.pathname === '/') {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/account' },
    { icon: Send, label: 'Send', path: '/send' },
    { icon: Download, label: 'Receive', path: '/receive' },
    { icon: MessageSquare, label: 'Message', path: '/message' },
    { icon: Plus, label: 'Deposit', path: '/deposit' },
    { icon: MoreHorizontal, label: 'More', path: '/more' }
  ];

  // For mobile view, show navigation at the bottom except on main and settings pages
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-[#ffa500] bg-black/30 backdrop-blur-sm z-40 px-4">
        <div className="flex items-center justify-around w-full h-full max-w-2xl mx-auto">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              variant="ghost"
              size="sm"
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg h-full
                ${location.pathname === path ? 'text-[#ffa500] drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'text-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{label}</span>
            </Button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-[#ffa500] bg-black/30 backdrop-blur-sm z-40 px-4">
      <div className="flex items-center w-full h-full max-w-4xl mx-auto">
        <img src="/logo-256x256.png" alt="Conceal Logo" className="h-8 w-8 mr-8" />
        <div className="flex items-center justify-center flex-1 gap-8">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              variant="ghost"
              className={`
                flex items-center gap-2
                ${location.pathname === path ? 'text-[#ffa500] drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'text-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}