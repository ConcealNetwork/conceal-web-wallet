import React from 'react';
import { useState, useEffect } from 'react';
import { Wallet, Send, Download, MessageSquare, Plus, Settings, ArrowLeft, Moon, Sun, ArrowUpRight, ArrowDownLeft, SwitchCamera } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { SyncStatus } from './components/SyncStatus';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ThemeContext = React.createContext({
  isDarkMode: true,
  toggleTheme: () => {},
});

function MainPage() {
  const navigate = useNavigate();
  const [hasStoredWallet, setHasStoredWallet] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const wallet = localStorage.getItem('wallet');
    setHasStoredWallet(!!wallet);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 relative z-10">
      <img 
        src="/logo-256x256.png" 
        alt="Conceal Logo" 
        className={`absolute ${isMobile ? 'top-3 left-2 h-12 w-12' : 'top-8 left-8 h-14 w-14'}`}
      />
      <div className="text-center mt-12 mb-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">Conceal Web Wallet</h1>
      </div>
      
      <Button
        onClick={() => navigate('/transaction')}
        variant="outline"
        className="w-64 gap-2"
      >
        <Download className="w-5 h-5" />
        Import Wallet
      </Button>

      <Button
        onClick={() => navigate('/transaction')}
        variant="outline"
        className="w-64 gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Wallet
      </Button>

      {hasStoredWallet && (
        <Button
          onClick={() => navigate('/transaction')}
          variant="outline"
          className="w-64 gap-2"
        >
          <Wallet className="w-5 h-5" />
          Open Existing Wallet
        </Button>
      )}
    </div>
  );
}

function TransactionPage() {
  const [isAmountHidden, setIsAmountHidden] = useState(false);
  const amount = "1,234.56";
  const { isDarkMode } = React.useContext(ThemeContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const transactions = [
    { id: 1, type: 'send', amount: '50.00', address: '4B1...7F9', date: '2024-03-10 14:30' },
    { id: 2, type: 'receive', amount: '75.25', address: '8C2...3E4', date: '2024-03-09 11:15' },
    { id: 3, type: 'send', amount: '25.50', address: '2A5...9B8', date: '2024-03-08 09:45' },
    { id: 4, type: 'receive', amount: '100.00', address: '6D7...1C2', date: '2024-03-07 16:20' },
    { id: 5, type: 'send', amount: '30.75', address: '9E8...4A3', date: '2024-03-06 13:10' },
    { id: 6, type: 'receive', amount: '200.00', address: '7F1...2D8', date: '2024-03-05 10:30' },
    { id: 7, type: 'send', amount: '45.25', address: '3H9...6K4', date: '2024-03-04 15:45' },
    { id: 8, type: 'receive', amount: '150.75', address: '5M2...8N7', date: '2024-03-03 12:20' },
    { id: 9, type: 'send', amount: '80.50', address: '1P6...4R9', date: '2024-03-02 09:15' },
    { id: 10, type: 'receive', amount: '95.25', address: '9T3...7W2', date: '2024-03-01 14:40' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {isMobile ? (
        <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-black/30 backdrop-blur-sm border-b border-[#ffa500]">
          <div className="flex items-center justify-between h-full px-4">
            <img src="/logo-256x256.png" alt="Conceal Logo" className="h-8 w-8" />
            <Button
              variant="ghost"
              onClick={() => setIsAmountHidden(!isAmountHidden)}
              className="text-2xl font-bold hover:opacity-80 transition-opacity text-white drop-shadow-lg"
            >
              {isAmountHidden ? "******" : `${amount} ₡ CCX`}
            </Button>
            <div className="w-8 h-8" />
          </div>
        </div>
      ) : null}

      <div className={`flex flex-col items-center ${isMobile ? 'pt-24' : 'pt-24'} pb-32 px-4`}>
        <div className="w-full max-w-md flex flex-col gap-6">
          {!isMobile && (
            <div className="text-center mb-4">
              <Button
                variant="ghost"
                onClick={() => setIsAmountHidden(!isAmountHidden)}
                className="text-4xl font-bold hover:opacity-80 transition-opacity text-white drop-shadow-lg"
              >
                {isAmountHidden ? "******" : `${amount} ₡ CCX`}
              </Button>
            </div>
          )}

          <SyncStatus />

          <div className="bg-black/30 backdrop-blur-sm border border-[#ffa500] rounded-lg">
            <div className="sticky top-0 p-4 border-b border-[#ffa500] bg-black/20">
              <h2 className="font-semibold text-white">Transaction History</h2>
            </div>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="p-4 border-b border-[#ffa500] last:border-b-0 hover:bg-black/40 transition-colors text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      )}
                      <div>
                        <p className="font-medium">{tx.type === 'send' ? 'Sent' : 'Received'}</p>
                        <p className="text-sm opacity-70">{tx.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} CCX
                      </p>
                      <p className="text-sm opacity-70">{tx.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MorePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 pb-24 pt-24 md:pt-32 relative z-10">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <Button
            onClick={() => {}} 
            variant="outline"
            className="w-full justify-between"
          >
            Network Stats
            <Settings className="w-5 h-5" />
          </Button>

          <Accordion type="single" collapsible className="w-full bg-black/30 backdrop-blur-sm border border-[#ffa500] rounded-lg overflow-hidden">
            <AccordionItem value="donation" className="border-b-0">
              <AccordionTrigger>
                <div className="flex items-center justify-between flex-1">
                  <span>Make a Donation</span>
                  <Wallet className="w-5 h-5" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 text-white">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Conceal:</p>
                    <p className="text-sm break-all bg-black/20 p-2 rounded">
                      ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Monero:</p>
                    <p className="text-sm break-all bg-black/20 p-2 rounded">
                      41gW3g6qVxoTqRQAZwNpREfYntrmH31PvJLxKVfU7hGySukxB2YVMn3exzoEfV6pAy2GzubVKZpTrRfYJnMCrjG421e8WbY
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={() => {}} 
            variant="outline"
            className="w-full justify-between"
          >
            Switch Wallet
            <SwitchCamera className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => navigate('/')} 
            variant="destructive"
            className="w-full justify-between"
          >
            Disconnect Wallet
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

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
            <Route path="/transaction" element={<TransactionPage />} />
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