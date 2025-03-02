import React, { useState, useEffect } from 'react';
import { Wallet, Download, Plus, Key, File, BookOpen, QrCode } from 'lucide-react';
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

export function MainPage() {
  const navigate = useNavigate();
  const [hasStoredWallet, setHasStoredWallet] = useState(false);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const hasWallet = await WalletRepository.hasOneStored();
        setHasStoredWallet(hasWallet);
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
  }, []);

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
      </div>

      {hasStoredWallet && (
        <Button
          onClick={() => setOpenWalletDialog(true)}
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
                onClick={() => navigate('/import/mnemonic')}
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

      <OpenWalletDialog 
        open={openWalletDialog} 
        onOpenChange={setOpenWalletDialog}
      />
    </div>
  );
}