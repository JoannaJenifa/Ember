'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Loader2, Minus, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sendGift, GiftType } from '@/lib/ember/gift-transactions';
import { useGiftPrices, GIFT_NAMES, GIFT_EMOJIS } from '@/hooks/use-gifts';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAvailable } from '@/app/providers';
import type { TransactionContext } from '@/lib/ember/transactions';

interface GiftSelectorProps {
  streamerAddress: string;
  onSuccess?: (txHash: string, giftType: number, quantity: number) => void;
  className?: string;
}

export function GiftSelector({ streamerAddress, onSuccess, className }: GiftSelectorProps) {
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { prices, loading: pricesLoading } = useGiftPrices();
  const { walletAddress, isConnected, isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();
  const isPrivyAvailable = usePrivyAvailable();
  const privyHook = isPrivyAvailable ? usePrivy() : null;

  const formatPrice = (price: number) => (price / 1e8).toFixed(0);

  const selectedPrice = selectedGift !== null ? prices[selectedGift]?.price || 0 : 0;
  const totalCost = selectedPrice * quantity;

  const handleSend = async () => {
    if (!walletAddress || selectedGift === null) return;

    setIsLoading(true);
    const loadingToast = toast.loading(`Sending ${GIFT_NAMES[selectedGift]}...`);

    try {
      const context: TransactionContext = {
        isPrivy,
        signRawHash: isPrivy && privyHook ? privyHook.signMessage : undefined,
        publicKeyHex: isPrivy ? publicKeyHex : undefined,
        signAndSubmitTransaction: !isPrivy ? signAndSubmitTransaction ?? undefined : undefined,
      };

      const txHash = await sendGift(
        walletAddress,
        streamerAddress,
        selectedGift as GiftType,
        quantity,
        '',
        context
      );

      toast.dismiss(loadingToast);
      toast.success('Gift sent!', {
        description: `${quantity}x ${GIFT_EMOJIS[selectedGift]} ${GIFT_NAMES[selectedGift]} sent`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://explorer.movementnetwork.xyz/txn/${txHash}`, '_blank'),
        },
      });

      onSuccess?.(txHash, selectedGift, quantity);
      setSelectedGift(null);
      setQuantity(1);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to send gift', {
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
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Connect wallet to send gifts</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-amber-500" />
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
                    ? 'border-coral bg-coral/10'
                    : 'border-border hover:border-coral/50'
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
                  <span className="font-bold text-coral">
                    {formatPrice(totalCost)} MOVE
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSend}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send {quantity}x {GIFT_EMOJIS[selectedGift]} {GIFT_NAMES[selectedGift]}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
