'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
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
import { ExternalLink, Loader2, Package } from 'lucide-react'
import { useSeller } from '@/lib/hooks/use-seller'
import { useAccount } from '@/lib/web3/providers'
import { useProductForm } from '@/lib/hooks/use-product-form'
import { ImageUpload } from '@/components/product/image-upload'
import { useTranslation } from '@/lib/i18n'
import { CATEGORIES, CategoryId } from '@/lib/types/product'
import { toast } from 'sonner'

const EXPLORER_URL = 'https://sepolia.basescan.org'

export default function NewProductPage() {
  const router = useRouter()
  const { address } = useAccount()
  const { seller, loading: sellerLoading } = useSeller(address)
  const { t, locale } = useTranslation()
  const [imageUploading, setImageUploading] = useState(false)

  const { formData, loading, confirming, errors, updateField, submit } = useProductForm({
    product: null,
    sellerId: seller?.id || '',
    locale,
    onSuccess: ({ txHash, product }) => {
      // Store optimistic product in sessionStorage for immediate display
      const existingProducts = JSON.parse(sessionStorage.getItem('optimisticProducts') || '[]')
      sessionStorage.setItem('optimisticProducts', JSON.stringify([product, ...existingProducts]))

      // Show success toast with View Tx action
      toast.success(t('product.productSaved'), {
        action: {
          label: 'View Tx',
          onClick: () => window.open(`${EXPLORER_URL}/tx/${txHash}`, '_blank')
        },
        duration: 5000,
      })

      router.push('/sell/products')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  if (sellerLoading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </main>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{t('seller.registerFirst')}</p>
            <Link href="/sell/register">
              <Button className="mt-4">{t('seller.register')}</Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('product.addProduct')}</h1>
          <p className="text-muted-foreground">{t('product.addFirstProduct')}</p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto p-6">
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
                onUploadingChange={setImageUploading}
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
                  type="text"
                  inputMode="decimal"
                  value={formData.priceVery}
                  onChange={(e) => {
                    // Allow only valid decimal input
                    const val = e.target.value
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      updateField('priceVery', val)
                    }
                  }}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sell/products')}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading || confirming || imageUploading} className="bg-coral hover:bg-coral/90">
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('product.saving')}
                  </>
                ) : imageUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('product.uploadImages')}...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    {t('product.addProduct')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
