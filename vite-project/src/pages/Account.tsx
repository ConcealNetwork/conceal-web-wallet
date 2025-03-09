import { useState, useEffect, useContext } from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SyncStatus } from '../components/SyncStatus';
import { ThemeContext } from '../context/ThemeContext';

export function Account() {
  const [isAmountHidden, setIsAmountHidden] = useState(false);
  const amount = "1,234.56";
  const { isDarkMode } = useContext(ThemeContext);
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