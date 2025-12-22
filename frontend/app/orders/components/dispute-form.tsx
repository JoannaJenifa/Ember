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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { disputeOrder } from '@/lib/ember/order-transactions';

const DISPUTE_REASONS = [
  { value: 'not_received', label: 'Item not received' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'damaged', label: 'Item damaged or defective' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'quality', label: 'Poor quality' },
  { value: 'other', label: 'Other' },
];

interface DisputeFormProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisputeForm({ orderId, onClose, onSuccess }: DisputeFormProps) {
  const { walletAddress, isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('not_as_described');
  const [description, setDescription] = useState('The serum I received has a different consistency than shown in the demo. It seems thinner and the scent is different from what was described.');

  const handleSubmit = async () => {
    if (!walletAddress) return;
    if (!reason) {
      toast.error('Please select a reason for the dispute');
      return;
    }

    setLoading(true);
    try {
      await disputeOrder(walletAddress, orderId, {
        isPrivy,
        publicKeyHex,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      });
      toast.success('Dispute submitted successfully');
      onSuccess();
    } catch (err) {
      console.error('Failed to submit dispute:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Dispute Order
          </DialogTitle>
          <DialogDescription>
            Submit a dispute for Order #{orderId}. Our team will review and resolve the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Dispute *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              placeholder="Please provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-4">
          <p>
            Once a dispute is submitted, the funds will be held in escrow until the dispute is
            resolved. Our support team will contact you within 24-48 hours.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Dispute'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
