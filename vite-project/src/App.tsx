import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { Button } from "@/components/ui/button";
import { MainPage } from './pages/MainPage';
import { AccountPage } from './pages/AccountPage';
import { MorePage } from './pages/MorePage';
import { ThemeContext } from './context/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-all text-white z-50"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072")',
            filter: isDarkMode ? 'brightness(0.6)' : 'brightness(0.9)'
          }}
        />
        <ThemeToggle />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/account" element={<AccountPage />} />
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