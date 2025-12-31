'use client';

import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Product } from '@/lib/ember/product-queries';
import { createOrder } from '@/lib/ember/order-transactions';
import { toast } from 'sonner';

interface PurchaseFormProps {
  product: Product;
}

export function PurchaseForm({ product }: PurchaseFormProps) {
  const { t } = useTranslation();
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [shippingInfo, setShippingInfo] = useState('John Doe\n123 Demo Street, Apt 4B\nSan Francisco, CA 94102\nUSA\nPhone: +1 555-123-4567');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const totalPrice = (product.price * quantity) / 1e8;
  const maxQuantity = Math.min(product.inventory, 10);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  const handlePurchase = async () => {
    if (!account?.address || !connected) {
      toast.error(t('errors.walletNotConnected'));
      return;
    }
    if (!shippingInfo.trim()) {
      toast.error(t('order.shippingRequired'));
      return;
    }

    setLoading(true);
    try {
      const txHash = await createOrder(
        account.address,
        product.id,
        quantity,
        shippingInfo,
        {
          isPrivy: false,
          signAndSubmitTransaction,
        }
      );
      toast.success(t('order.purchaseSuccess'));
      setShowForm(false);
      setQuantity(1);
      setShippingInfo('');
    } catch (err: any) {
      console.error('Purchase failed:', err);
      toast.error(err.message || t('order.purchaseFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (product.inventory === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t('product.stock')}:</span>
          <span className="text-destructive">{t('order.soldOut')}</span>
        </div>
        <Button className="w-full h-12" disabled>
          {t('order.soldOut')}
        </Button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t('product.stock')}:</span>
          <span className="text-foreground">{product.inventory} {t('product.available')}</span>
        </div>
        <Button
          className="w-full bg-ember hover:bg-ember/90 h-12 text-lg"
          onClick={() => setShowForm(true)}
        >
          {t('order.buyNow')}
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-4 bg-card border-border">
      <div className="space-y-2">
        <Label>{t('order.quantity')}</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
            className="w-20 text-center"
            min={1}
            max={maxQuantity}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">/ {product.inventory}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('order.shippingInfo')}</Label>
        <Textarea
          placeholder={t('order.shippingPlaceholder')}
          value={shippingInfo}
          onChange={(e) => setShippingInfo(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-baseline justify-between pt-2 border-t border-border">
        <span className="text-muted-foreground">{t('order.total')}:</span>
        <span className="text-2xl font-bold text-ember">{totalPrice.toFixed(4)} MOVE</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button
          className="flex-1 bg-ember hover:bg-ember/90"
          onClick={handlePurchase}
          disabled={loading || !connected}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('common.processing')}
            </>
          ) : !connected ? (
            t('errors.walletNotConnected')
          ) : (
            t('order.confirmPurchase')
          )}
        </Button>
      </div>
    </Card>
  );
}
