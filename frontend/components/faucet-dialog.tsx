'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Droplets, Check, ExternalLink } from 'lucide-react';
import { useFaucet } from '@/hooks/use-faucet';
import { getExplorerUrl } from '@/lib/aptos';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

interface FaucetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
}

export function FaucetDialog({ open, onOpenChange, address }: FaucetDialogProps) {
  const [amount, setAmount] = useState('100');
  const { mint, status, error, txHash, reset } = useFaucet();
  const t = useT();

  // Show toast notification when mint succeeds or fails
  useEffect(() => {
    if (status === 'success' && txHash) {
      toast.success(`${amount} tUSDC minted!`, {
        action: {
          label: 'View',
          onClick: () => window.open(getExplorerUrl(txHash), '_blank'),
        },
      });
    } else if (status === 'error' && error) {
      toast.error('Mint failed', { description: error });
    }
  }, [status, txHash, amount, error]);

  const handleMint = async () => {
    if (!amount) return;
    await mint(amount);
  };

  const handleReset = () => {
    setAmount('100');
    reset();
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            {t('faucet.title')}
          </DialogTitle>
          <DialogDescription>
            {t('faucet.description')}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <SuccessView
            amount={amount}
            txHash={txHash}
            onReset={handleReset}
            t={t}
          />
        ) : (
          <MintForm
            amount={amount}
            onAmountChange={setAmount}
            error={error}
            status={status}
            onMint={handleMint}
            address={address}
            t={t}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessView({
  amount,
  txHash,
  onReset,
  t,
}: {
  amount: string;
  txHash: string | null;
  onReset: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
        <Check className="h-6 w-6 text-green-500" />
      </div>
      <div className="text-center">
        <p className="font-medium">{t('faucet.success')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {amount} tUSDC {t('faucet.sentToWallet')}
        </p>
      </div>
      {txHash && (
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          {t('common.viewTransaction')}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <Button onClick={onReset} variant="outline" className="mt-2">
        {t('faucet.mintMore')}
      </Button>
    </div>
  );
}

function MintForm({
  amount,
  onAmountChange,
  error,
  status,
  onMint,
  address,
  t,
}: {
  amount: string;
  onAmountChange: (amount: string) => void;
  error: string | null;
  status: string;
  onMint: () => void;
  address: string;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Token Display */}
      <div className="space-y-2">
        <Label>{t('faucet.token')}</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-medium text-green-500">
            $
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">tUSDC</p>
            <p className="text-xs text-muted-foreground">Test USDC</p>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount">{t('faucet.amount')}</Label>
        <Input
          id="amount"
          type="number"
          placeholder="100"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          min="1"
          step="1"
        />
        <div className="flex gap-2">
          {['10', '100', '1000'].map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => onAmountChange(preset)}
              className="flex-1"
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="p-3 rounded-lg bg-muted/50 text-sm">
        <span className="text-muted-foreground">{t('faucet.recipient')}: </span>
        <span className="font-mono">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button
        onClick={onMint}
        disabled={!amount || status === 'loading'}
        className="w-full"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('faucet.minting')}
          </>
        ) : (
          <>
            <Droplets className="mr-2 h-4 w-4" />
            {t('faucet.mint')} {amount} tUSDC
          </>
        )}
      </Button>
    </div>
  );
}
