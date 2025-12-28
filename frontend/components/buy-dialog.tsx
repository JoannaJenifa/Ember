'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Loader2, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { formatUsdcAmount } from '@/lib/aptos';
import { Product } from '@/lib/ember/product-queries';
import { createOrder } from '@/lib/ember/order-transactions';
import { useWalletContext } from '@/hooks/use-wallet-context';

interface BuyDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (txHash: string) => void;
}

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

export function BuyDialog({ product, open, onOpenChange, onSuccess }: BuyDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const {
    walletAddress,
    isPrivy,
    signRawHash,
    publicKeyHex,
    signAndSubmitTransaction,
  } = useWalletContext();

  if (!product) return null;

  const maxQuantity = Math.min(product.inventory, 10);
  const totalPrice = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!shipping.fullName || !shipping.phone || !shipping.address || !shipping.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Processing order...');

    try {
      // Prepare shipping JSON for on-chain (minimal public data)
      const shippingJson = JSON.stringify({
        city: shipping.city,
        notes: shipping.notes,
      });

      // First, create on-chain order
      const txHash = await createOrder(walletAddress, product.id, quantity, shippingJson, {
        isPrivy,
        signRawHash: signRawHash || undefined,
        publicKeyHex: publicKeyHex || undefined,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      });

      // Store sensitive shipping data in Supabase
      await fetch('/api/orders/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hash: txHash,
          buyer_address: walletAddress,
          seller_address: product.seller,
          product_id: product.id,
          quantity,
          total_price: totalPrice,
          shipping_name: shipping.fullName,
          shipping_phone: shipping.phone,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_postal_code: shipping.postalCode,
          shipping_notes: shipping.notes,
        }),
      });

      toast.dismiss(loadingToast);
      toast.success('Order placed!', {
        description: `${quantity}x ${product.title}`,
        action: {
          label: 'View TX',
          onClick: () =>
            window.open(
              `https://explorer.movementnetwork.xyz/txn/${txHash}?network=testnet`,
              '_blank'
            ),
        },
      });

      onSuccess?.(txHash);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error('Order creation failed:', err);
      toast.dismiss(loadingToast);
      toast.error('Failed to place order', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuantity(1);
    setShipping({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-ember" />
            Complete Purchase
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-muted rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-background shrink-0">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-2">{product.title}</p>
              <p className="text-ember font-bold">
                ${formatUsdcAmount(product.price)}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {product.inventory} available
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Shipping Information</Label>
            </div>

            <div className="grid gap-3">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="123 Main Street, Apt 4B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Delivery Notes</Label>
                <Textarea
                  id="notes"
                  value={shipping.notes}
                  onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                  placeholder="Leave at door, ring bell twice..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Total & Submit */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total</span>
              </div>
              <span className="text-xl font-bold text-ember">
                ${formatUsdcAmount(totalPrice)}
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
