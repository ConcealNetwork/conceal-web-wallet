import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { Button } from "@/components/ui/button";
import { Index } from '@/pages/index';
import { Account } from '@/pages/Account';
import { MorePage } from '@/pages/MorePage';
import { ThemeContext } from './context/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-all text-white z-50 w-10 h-10 flex items-center justify-center"
    >
      {isDarkMode ? 
        <Sun className="h-[1.2rem] w-[1.2rem]" /> : 
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      }
    </Button>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className="min-h-screen relative flex flex-col">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://github.com/ConcealNetwork/conceal-web-wallet/raw/f04a4e98a43ef65aae96530f521951858eac96de/src/assets/img/landing/bg-dark.webp")',
            filter: isDarkMode ? 'brightness(0.6)' : 'brightness(0.9)'
          }}
        />
        <ThemeToggle />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/account" element={<Account />} />
            <Route path="/more" element={<MorePage />} />
          </Routes>
        </main>
        <Navigation />
        {location.pathname === '/' && <Footer />}
      </div>
    </ThemeContext.Provider>
  );
}

export default App