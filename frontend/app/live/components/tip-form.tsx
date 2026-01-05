'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { DollarSign, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendTip } from '@/lib/ember/tip-transactions';
import { useWalletContext } from '@/hooks/use-wallet-context';
import type { TransactionContext } from '@/lib/ember/transactions';
import { getDemoTip } from '@/lib/demo/templates';
import { TransactionConfirmDialog, TransactionDetails } from '@/components/ui/transaction-confirm-dialog';

const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

interface TipFormProps {
  streamerAddress: string;
  streamId?: string;
  onSuccess?: (txHash: string, amount: number, message: string) => void;
  className?: string;
}

export function TipForm({ streamerAddress, streamId, onSuccess, className }: TipFormProps) {
  const demoTip = useMemo(() => getDemoTip(), []);

  const [amount, setAmount] = useState<string>(demoTip.amount);
  const [message, setMessage] = useState(demoTip.message);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { walletAddress, isConnected, isPrivy, publicKeyHex, signRawHash, signAndSubmitTransaction } = useWalletContext();

  const handlePresetClick = (preset: number) => {
    setAmount(preset.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid tip amount' });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!walletAddress || !amount) return;

    const amountNum = parseFloat(amount);
    setIsLoading(true);

    try {
      const amountInOctas = Math.floor(amountNum * 1e8);

      const context: TransactionContext = {
        isPrivy,
        publicKeyHex,
        signRawHash: signRawHash || undefined,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      };

      const txHash = await sendTip(
        walletAddress,
        streamerAddress,
        amountInOctas,
        message || '',
        context
      );

      setShowConfirm(false);
      toast.success('Tip sent!', {
        description: `$${amountNum} sent successfully`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://explorer.movementnetwork.xyz/txn/${txHash}`, '_blank'),
        },
      });

      if (streamId) {
        const chatMessage = message ? `tipped $${amountNum}: "${message}"` : `tipped $${amountNum}`;
        fetch(`/api/streams/${streamId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_address: walletAddress,
            message: chatMessage,
            message_type: 'tip',
            metadata: { amount: amountNum, txHash },
          }),
        }).catch(console.error);
      }

      onSuccess?.(txHash, amountNum, message);
      setAmount('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send tip', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const transactionDetails: TransactionDetails | null = amount ? {
    title: 'Confirm Tip',
    description: 'Review your tip details before sending',
    icon: <DollarSign className="h-5 w-5 text-ember" />,
    items: [
      { label: 'Recipient', value: formatAddress(streamerAddress) },
      { label: 'Amount', value: `$${parseFloat(amount).toFixed(2)} USDC`, highlight: true },
      ...(message ? [{ label: 'Message', value: message.length > 30 ? message.slice(0, 30) + '...' : message }] : []),
    ],
  } : null;

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
    <>
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-ember" />
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
                  ${preset}
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
            className="w-full bg-ember hover:bg-ember/90"
            disabled={!amount || isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send {amount ? `$${amount}` : 'Tip'}
          </Button>
        </form>
      </Card>

      <TransactionConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        details={transactionDetails}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
        confirmText="Send Tip"
      />
    </>
  );
}
