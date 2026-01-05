'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Product } from '@/lib/ember/product-queries';
import { BuyDialog } from '@/components/buy-dialog';
import { useWalletContext } from '@/hooks/use-wallet-context';

interface PurchaseFormProps {
  product: Product;
}

export function PurchaseForm({ product }: PurchaseFormProps) {
  const { t } = useTranslation();
  const { isConnected } = useWalletContext();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t('product.stock')}:</span>
          <span className="text-foreground">{product.inventory} {t('product.available')}</span>
        </div>
        <Button
          className="w-full bg-ember hover:bg-ember/90 h-12 text-lg"
          onClick={() => setBuyDialogOpen(true)}
          disabled={!isConnected}
        >
          {isConnected ? t('order.buyNow') : t('errors.walletNotConnected')}
        </Button>
      </div>

      <BuyDialog
        product={product}
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
      />
    </>
  );
}
