'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { ImageUpload } from './image-upload'
import { useProductForm } from '@/lib/hooks/use-product-form'
import { CATEGORIES, CategoryId } from '@/lib/types/product'
import type { ProductWithSeller } from '@/lib/types/product'
import type { ProductFormResult } from '@/lib/hooks/use-product-form'
import { useTranslation } from '@/lib/i18n'

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductWithSeller | null
  sellerId: string
  onSuccess?: (result: ProductFormResult) => void
}

export function ProductForm({ open, onOpenChange, product, sellerId, onSuccess }: ProductFormProps) {
  const { t, locale } = useTranslation()
  const { formData, loading, errors, updateField, submit, isEditing } = useProductForm({
    product,
    sellerId,
    locale,
    onSuccess: (data) => {
      onSuccess?.(data)
      onOpenChange(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('product.editProduct') : t('product.addProduct')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('product.productName')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Product title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleKo">{t('product.productNameKo')}</Label>
              <Input
                id="titleKo"
                value={formData.titleKo}
                onChange={(e) => updateField('titleKo', e.target.value)}
                placeholder={t('product.productName')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t('product.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionKo">{t('product.descriptionKo')}</Label>
              <Textarea
                id="descriptionKo"
                value={formData.descriptionKo}
                onChange={(e) => updateField('descriptionKo', e.target.value)}
                placeholder={t('product.description')}
                rows={3}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>{t('product.images')} *</Label>
            <ImageUpload
              images={formData.images}
              onChange={(images) => updateField('images', images)}
              disabled={loading}
            />
            {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
          </div>

          {/* Price, Inventory, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceVery">{t('product.price')} *</Label>
              <Input
                id="priceVery"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceVery || ''}
                onChange={(e) => updateField('priceVery', e.target.value || '0')}
                placeholder="0.00"
                className={errors.priceVery ? 'border-destructive' : ''}
              />
              {errors.priceVery && <p className="text-xs text-destructive">{errors.priceVery}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">{t('product.stock')}</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => updateField('inventory', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.inventory ? 'border-destructive' : ''}
              />
              {errors.inventory && <p className="text-xs text-destructive">{errors.inventory}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t('product.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField('category', value as CategoryId)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t('register.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label} ({cat.labelEn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('product.saving')}
                </>
              ) : isEditing ? (
                t('common.edit')
              ) : (
                t('common.register')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
