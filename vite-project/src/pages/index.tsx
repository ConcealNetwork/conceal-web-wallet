import { useState, useEffect } from 'react';
import { Wallet, Download, Plus, Key, File, BookOpen, QrCode, Send, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WalletRepository } from '@shared/model/WalletRepository';
import { OpenWalletDialog } from '../components/OpenWalletDialog';
import { BlockchainExplorer } from '@shared/model/blockchain/BlockchainExplorer';
import { BlockchainExplorerProvider } from '@shared/providers/BlockchainExplorerProvider';
import { DependencyInjectorInstance } from '@shared/lib/numbersLab/DependencyInjector';
import { Wallet as WalletModel } from '@shared/model/Wallet';
import { ImportFromMnemonic } from '@/components/ImportFromMnemonic';

export function Index() {
  const navigate = useNavigate();
  const [hasStoredWallet, setHasStoredWallet] = useState(false);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [_isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  useEffect(() => {
    // Check if wallet is already loaded
    const wallet = DependencyInjectorInstance().getInstance(WalletModel.name, 'default', false);
    
    // If wallet is already loaded, redirect to account page
    if (wallet !== null) {
      navigate('/account');
    }

    // Check if there's a stored wallet
    const checkWallet = async () => {
      try {
        const hasWallet = await WalletRepository.hasOneStored();
        setHasStoredWallet(hasWallet);
        
        setIsWalletLoaded(DependencyInjectorInstance().getInstance(WalletModel.name, 'default', false) !== null);
      } catch (err) {
        console.error('Error checking wallet:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkWallet();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const loadWallet = async () => {
    const blockchainExplorer = BlockchainExplorerProvider.getInstance();
    
    try {
      const success = await blockchainExplorer.initialize();
      if (success) {
        setOpenWalletDialog(true);
      }
    } catch (error) {
      console.error('Error initializing blockchain explorer:', error);
    }
  };

  const handleBackFromMnemonic = () => {
    setShowMnemonic(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#ffa500]" />
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 relative z-10">
      <img 
        src="/logo-256x256.png" 
        alt="Conceal Logo" 
        className={`absolute ${isMobile ? 'top-3 left-2 h-12 w-12' : 'top-8 left-8 h-14 w-14'}`}
      />
      <div className="text-center mt-12 mb-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">Conceal Web Wallet</h1>
        <h2 className="text-xl text-gray-300 mt-2">Secure, fast, and easy to use</h2>
      </div>

      {showMnemonic ? (
        <ImportFromMnemonic onBack={handleBackFromMnemonic} />
      ) : (
        <>
          {hasStoredWallet && (
            <Button
              onClick={loadWallet}
              variant="outline"
              className="w-64 gap-2"
            >
              <Wallet className="w-5 h-5" />
              Open My Wallet
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/create-wallet')}
            variant="outline"
            className="w-64 gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Wallet
          </Button>

          <Accordion type="single" collapsible className="w-64">
            <AccordionItem value="import" className="border border-[#ffa500] rounded-lg bg-black/30 backdrop-blur-sm">
              <AccordionTrigger className="px-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Import Wallet
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate('/import/keys')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Key className="w-4 h-4" />
                    From Private Keys
                  </Button>

                  <Button
                    onClick={() => navigate('/import/file')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <File className="w-4 h-4" />
                    From Wallet File
                  </Button>

                  <Button
                    onClick={() => setShowMnemonic(true)}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    From Mnemonic Phrase
                  </Button>
                  {/*
                  <Button
                    onClick={() => navigate('/import/qr')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    From QR Code
                  </Button>
                  */}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}

      {/* Features section similar to the original notesBlock */}
      {!showMnemonic && (
        <div className="mt-36 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-[#ffa500]/30 text-center">
              <Wallet className="w-8 h-8 mx-auto mb-4 text-[#ffa500]" />
              <h3 className="text-lg font-bold mb-2 text-[#fafafa]">Secure</h3>
              <p className="text-sm text-gray-300">Your keys, your coins. All data is stored locally.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-[#ffa500]/30 text-center">
              <Send className="w-8 h-8 mx-auto mb-4 text-[#ffa500]" />
              <h3 className="text-lg font-bold mb-2 text-[#fafafa]">Fast</h3>
              <p className="text-sm text-gray-300">Send and receive CCX quickly and easily.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-[#ffa500]/30 text-center">
              <Key className="w-8 h-8 mx-auto mb-4 text-[#ffa500]" />
              <h3 className="text-lg font-bold mb-2 text-[#fafafa]">Technology</h3>
              <p className="text-sm text-gray-300">Advanced cryptography keeps your funds safe.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-[#ffa500]/30 text-center">
              <Code className="w-8 h-8 mx-auto mb-4 text-[#ffa500]" />
              <h3 className="text-lg font-bold mb-2 text-[#fafafa]">Open Source</h3>
              <a 
                href="https://github.com/ConcealNetwork/conceal-web-wallet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#ffa500] hover:underline"
              >
                View the code on GitHub
              </a>
            </div>
          </div>
        </div>
      )}

      <OpenWalletDialog 
        open={openWalletDialog} 
        onOpenChange={setOpenWalletDialog}
      />
    </div>
  );
}