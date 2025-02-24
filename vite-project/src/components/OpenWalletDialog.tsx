import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletRepository } from '@shared/model/WalletRepository';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OpenWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenWalletDialog({ open, onOpenChange }: OpenWalletDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const wallet = await WalletRepository.getLocalWalletWithPassword(password);
      if (wallet) {
        onOpenChange(false);
        navigate('/account');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to open wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter wallet password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Opening...' : 'Open Wallet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 