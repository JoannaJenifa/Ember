'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { DollarSign, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendTip } from '@/lib/ember/tip-transactions';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAvailable } from '@/app/providers';
import type { TransactionContext } from '@/lib/ember/transactions';

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

interface TipFormProps {
  streamerAddress: string;
  onSuccess?: (txHash: string, amount: number, message: string) => void;
  className?: string;
}

export function TipForm({ streamerAddress, onSuccess, className }: TipFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { walletAddress, isConnected, isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();
  const isPrivyAvailable = usePrivyAvailable();
  const privyHook = isPrivyAvailable ? usePrivy() : null;

  const handlePresetClick = (preset: number) => {
    setAmount(preset.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid tip amount' });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Sending tip...');

    try {
      const amountInOctas = Math.floor(amountNum * 1e8);

      const context: TransactionContext = {
        isPrivy,
        signRawHash: isPrivy && privyHook ? privyHook.signMessage : undefined,
        publicKeyHex: isPrivy ? publicKeyHex : undefined,
        signAndSubmitTransaction: !isPrivy ? signAndSubmitTransaction ?? undefined : undefined,
      };

      const txHash = await sendTip(
        walletAddress,
        streamerAddress,
        amountInOctas,
        message || '',
        context
      );

      toast.dismiss(loadingToast);
      toast.success('Tip sent!', {
        description: `${amountNum} MOVE sent successfully`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://explorer.movementnetwork.xyz/txn/${txHash}`, '_blank'),
        },
      });

      onSuccess?.(txHash, amountNum, message);
      setAmount('');
      setMessage('');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to send tip', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center text-muted-foreground">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Connect wallet to send tips</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-coral" />
        <h3 className="font-semibold">Send Tip</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetClick(preset)}
              >
                {preset} MOVE
              </Button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>

        <Textarea
          placeholder="Add a message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={2}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!amount || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send {amount ? `${amount} MOVE` : 'Tip'}
        </Button>
      </form>
    </Card>
  );
}
