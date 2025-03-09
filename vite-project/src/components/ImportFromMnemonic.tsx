import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Password } from '@shared/model/Password';
import { Wallet } from '@shared/model/Wallet';
import { KeysRepository } from '@shared/model/KeysRepository';
import { BlockchainExplorerProvider } from '@shared/providers/BlockchainExplorerProvider';
import { Mnemonic } from '@shared/model/Mnemonic';
import { Cn } from '@shared/model/Cn';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { BlockchainExplorer } from '@shared/model/blockchain/BlockchainExplorer';

// Don't initialize the blockchain explorer at the component level
// We'll initialize it inside the component when needed

const LANGUAGES = [
  { key: 'auto', name: 'Detect automatically' },
  { key: 'english', name: 'English' },
  { key: 'chinese', name: 'Chinese (simplified)' },
  { key: 'dutch', name: 'Dutch' },
  { key: 'electrum', name: 'Electrum' },
  { key: 'esperanto', name: 'Esperanto' },
  { key: 'french', name: 'French' },
  { key: 'italian', name: 'Italian' },
  { key: 'japanese', name: 'Japanese' },
  { key: 'lojban', name: 'Lojban' },
  { key: 'portuguese', name: 'Portuguese' },
  { key: 'russian', name: 'Russian' },
  { key: 'spanish', name: 'Spanish' },
  { key: 'ukrainian', name: 'Ukrainian' }
];

export function ImportFromMnemonic({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [insecurePassword, setInsecurePassword] = useState(false);
  const [forceInsecurePassword, setForceInsecurePassword] = useState(false);
  const [importHeight, setImportHeight] = useState(0);
  const [mnemonicPhrase, setMnemonicPhrase] = useState('');
  const [validMnemonicPhrase, setValidMnemonicPhrase] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!Password.checkPasswordConstraints(password, false)) {
      setInsecurePassword(true);
    } else {
      setInsecurePassword(false);
    }
  }, [password]);

  useEffect(() => {
    checkMnemonicValidity();
  }, [mnemonicPhrase, language]);

  const checkMnemonicValidity = () => {
    const splitted = mnemonicPhrase.trim().split(' ');
    if (splitted.length !== 25) {
      setValidMnemonicPhrase(false);
    } else {
      const detected = Mnemonic.detectLang(mnemonicPhrase.trim());
      if (language === 'auto') {
        setValidMnemonicPhrase(detected !== null);
      } else {
        setValidMnemonicPhrase(detected === language);
      }
    }
  };

  const formValid = () => {
    if (password !== password2) return false;
    if (!(password !== '' && (!insecurePassword || forceInsecurePassword))) return false;
    if (!validMnemonicPhrase) return false;
    return true;
  };

  const resetForm = () => {
    setPassword('');
    setPassword2('');
    setInsecurePassword(false);
    setForceInsecurePassword(false);
    setImportHeight(0);
    setMnemonicPhrase('');
    setValidMnemonicPhrase(false);
    setLanguage('auto');
    setIsLoading(false);
  };

  const handleBack = () => {
    resetForm();
    onBack();
  };

  const importWallet = async () => {
    setIsLoading(true);
    
    try {
      // Initialize the blockchain explorer inside the function
      const blockchainExplorer = BlockchainExplorerProvider.getInstance();
      const success = await blockchainExplorer.initialize();
      
      if (success) {
        const currentHeight = await blockchainExplorer.getHeight();
        
        const mnemonic = mnemonicPhrase.trim();
        let currentLang = 'english';

        if (language === 'auto') {
          const detectedLang = Mnemonic.detectLang(mnemonic);
          if (detectedLang !== null) {
            currentLang = detectedLang;
          }
        } else {
          currentLang = language;
        }

        const mnemonicDecoded = Mnemonic.mn_decode(mnemonic, currentLang);
        if (mnemonicDecoded !== null) {
          const keys = Cn.create_address(mnemonicDecoded);
          const newWallet = new Wallet();
          newWallet.keys = KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);

          let height = importHeight - 10;
          if (height < 0) height = 0;
          if (height > currentHeight) height = currentHeight;

          newWallet.lastHeight = height;
          newWallet.creationHeight = newWallet.lastHeight;
          
          localStorage.setItem('wallet', JSON.stringify(newWallet));
          localStorage.setItem('walletPassword', password);
          
          navigate('/account');
        } else {
          alert('Invalid mnemonic phrase');
        }
      }
    } catch (error) {
      console.error('Error importing wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button 
        variant="outline"
        size="sm"
        onClick={handleBack} 
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to main menu
      </Button>
      
      <div className="space-y-6 bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-[#ffa500]/30">
        <div className="flex items-center gap-2 text-xl font-semibold text-white">
          <BookOpen className="w-6 h-6 text-[#ffa500]" />
          <h2>Import Wallet from a Mnemonic Phrase</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Password to protect your wallet</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-black placeholder:text-gray-500"
            />
            {insecurePassword && !forceInsecurePassword && (
              <div className="text-red-500 text-sm">
                <p>Password does not meet security requirements</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setForceInsecurePassword(true)}
                  className="mt-2 gap-2"
                >
                  Use insecure password
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Confirm the password</label>
            <Input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="bg-white text-black placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Mnemonic phrase: 25 words</label>
            <Input
              value={mnemonicPhrase}
              onChange={(e) => setMnemonicPhrase(e.target.value)}
              className="bg-white text-black placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Language</label>
            <Select value={language} onValueChange={(value) => setLanguage(value)}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.key} value={language.key}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Height to import from:</label>
            <Input
              type="number"
              value={importHeight}
              onChange={(e) => setImportHeight(Number(e.target.value))}
              className="bg-white text-black placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="default"
            onClick={importWallet}
            disabled={!formValid() || isLoading}
            className="w-64 gap-2"
          >
            <BookOpen className="w-5 h-5" />
            {isLoading ? 'Importing...' : 'Import Wallet'}
          </Button>
        </div>
      </div>
    </div>
  );
} 