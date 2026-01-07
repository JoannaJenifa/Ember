'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { confirmDelivery } from '@/lib/ember/order-transactions';

interface DeliveryConfirmationProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliveryConfirmation({ orderId, onClose, onSuccess }: DeliveryConfirmationProps) {
  const { walletAddress, isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      await confirmDelivery(walletAddress, orderId, {
        isPrivy,
        publicKeyHex,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      });
      toast.success('Delivery confirmed! Funds have been released to the seller.');
      onSuccess();
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirm Delivery
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to confirm delivery for Order #{orderId}?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 my-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500 mb-1">Important</p>
              <p className="text-muted-foreground">
                Confirming delivery will release the payment to the seller. This action cannot be
                undone. Only confirm if you have received your order in good condition.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Delivery
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
