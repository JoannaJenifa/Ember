'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Loader2, Minus, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendGift, GiftType } from '@/lib/ember/gift-transactions';
import { useGiftPrices, GIFT_NAMES, GIFT_EMOJIS } from '@/hooks/use-gifts';
import { useWalletContext } from '@/hooks/use-wallet-context';
import type { TransactionContext } from '@/lib/ember/transactions';
import { TransactionConfirmDialog, TransactionDetails } from '@/components/ui/transaction-confirm-dialog';

interface GiftSelectorProps {
  streamerAddress: string;
  streamId?: string;
  onSuccess?: (txHash: string, giftType: number, quantity: number) => void;
  className?: string;
}

export function GiftSelector({ streamerAddress, streamId, onSuccess, className }: GiftSelectorProps) {
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { prices, loading: pricesLoading } = useGiftPrices();
  const { walletAddress, isConnected, isPrivy, publicKeyHex, signRawHash, signAndSubmitTransaction } = useWalletContext();

  const formatPrice = (price: number) => (price / 1e6).toFixed(0);
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const selectedPrice = selectedGift !== null ? prices[selectedGift]?.price || 0 : 0;
  const totalCost = selectedPrice * quantity;

  const handleSendClick = () => {
    if (!walletAddress || selectedGift === null) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!walletAddress || selectedGift === null) return;

    setIsLoading(true);

    try {
      const context: TransactionContext = {
        isPrivy,
        publicKeyHex,
        signRawHash: signRawHash || undefined,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      };

      const txHash = await sendGift(
        walletAddress,
        streamerAddress,
        selectedGift as GiftType,
        quantity,
        '',
        context
      );

      setShowConfirm(false);
      toast.success('Gift sent!', {
        description: `${quantity}x ${GIFT_EMOJIS[selectedGift]} ${GIFT_NAMES[selectedGift]} sent`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://explorer.movementnetwork.xyz/txn/${txHash}`, '_blank'),
        },
      });

      if (streamId) {
        const giftName = GIFT_NAMES[selectedGift];
        const giftEmoji = GIFT_EMOJIS[selectedGift];
        const chatMessage = `sent ${quantity}x ${giftEmoji} ${giftName}`;
        fetch(`/api/streams/${streamId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_address: walletAddress,
            message: chatMessage,
            message_type: 'gift',
            metadata: { giftType: selectedGift, giftName, quantity, txHash },
          }),
        }).catch(console.error);
      }

      onSuccess?.(txHash, selectedGift, quantity);
      setSelectedGift(null);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to send gift', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transactionDetails: TransactionDetails | null = selectedGift !== null ? {
    title: 'Confirm Gift',
    description: 'Review your gift details before sending',
    icon: <Gift className="h-5 w-5 text-ember" />,
    items: [
      { label: 'Recipient', value: formatAddress(streamerAddress) },
      { label: 'Gift', value: `${GIFT_EMOJIS[selectedGift]} ${GIFT_NAMES[selectedGift]}` },
      { label: 'Quantity', value: `${quantity}x` },
      { label: 'Total Cost', value: `$${formatPrice(totalCost)} USDC`, highlight: true },
    ],
  } : null;

  if (!isConnected) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Connect wallet to send gifts</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-ember" />
          <h3 className="font-semibold">Send Gift</h3>
        </div>

        {pricesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gift grid */}
            <div className="grid grid-cols-5 gap-2">
              {prices.map((gift, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedGift(index)}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg border transition-all',
                    selectedGift === index
                      ? 'border-ember bg-ember/10'
                      : 'border-border hover:border-ember/50'
                  )}
                >
                  <span className="text-2xl">{gift.emoji}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatPrice(gift.price)}
                  </span>
                </button>
              ))}
            </div>

            {/* Quantity selector */}
            {selectedGift !== null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      disabled={quantity >= 99}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Quick quantity buttons */}
                <div className="flex gap-2">
                  {[1, 5, 10, 25].map((q) => (
                    <Button
                      key={q}
                      variant={quantity === q ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setQuantity(q)}
                    >
                      {q}x
                    </Button>
                  ))}
                </div>

                {/* Total and send */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-ember">
                      ${formatPrice(totalCost)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-ember hover:bg-ember/90"
                    onClick={handleSendClick}
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send {quantity}x {GIFT_EMOJIS[selectedGift]} {GIFT_NAMES[selectedGift]}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <TransactionConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        details={transactionDetails}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
        confirmText="Send Gift"
      />
    </>
  );
}
