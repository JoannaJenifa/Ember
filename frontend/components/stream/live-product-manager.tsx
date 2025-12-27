'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, GripVertical, X, Star } from 'lucide-react'
import { useProducts } from '@/lib/hooks/use-products'
import type { ProductWithSeller } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'
import { formatVeryPrice } from '@/lib/utils/format'

interface StreamProductWithDetails {
  product_id: string
  display_order: number
  is_featured: boolean
  special_price_very: number | null
  product: ProductWithSeller | null
}

interface LiveProductManagerProps {
  streamId: string
  sellerId: string
  products: StreamProductWithDetails[]
  onAddProduct: (productId: string) => Promise<void>
  onRemoveProduct: (productId: string) => Promise<void>
  onReorder: (products: { productId: string; displayOrder: number }[]) => Promise<void>
}

export function LiveProductManager({
  streamId,
  sellerId,
  products,
  onAddProduct,
  onRemoveProduct,
  onReorder,
}: LiveProductManagerProps) {
  const { t } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { products: allProducts } = useProducts({ sellerId, activeOnly: true })

  // Memoize filtering to prevent recalculation on every render
  const availableProducts = useMemo(
    () => allProducts.filter((p) => !products.find((sp) => sp.product_id === p.id)),
    [allProducts, products]
  )

  const handleAdd = async (productId: string) => {
    await onAddProduct(productId)
    setShowAddDialog(false)
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{t('stream.products')}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t('product.addProduct')}
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t('stream.noProductsToFeature')}
        </p>
      ) : (
        <div className="space-y-2">
          {products.filter(sp => sp.product_id && sp.product).map((sp) => (
            <div
              key={sp.product_id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <div className="h-10 w-10 rounded bg-muted flex-shrink-0 overflow-hidden">
                {sp.product?.images?.[0] && (
                  <img
                    src={sp.product.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {sp.product?.descriptionKo || sp.product?.title || 'Product'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatVeryPrice(sp.product?.priceVery)} VERY
                </p>
              </div>
              {sp.is_featured && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => sp.product_id && onRemoveProduct(sp.product_id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('product.addProduct')}</DialogTitle>
          </DialogHeader>
          {availableProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('stream.noProductsToFeature')}
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.descriptionKo || product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatVeryPrice(product.priceVery)} VERY
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
