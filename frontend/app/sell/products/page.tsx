'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, Plus, Search, Loader2 } from 'lucide-react'
import { ProductTable } from '@/components/product/product-table'
import { ProductForm } from '@/components/product/product-form'
import { useProducts } from '@/lib/hooks/use-products'
import { CATEGORIES, CategoryId, ProductWithSeller } from '@/lib/types/product'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import { useSeller } from '@/lib/hooks/use-seller'
import { useAccount } from '@/lib/web3'

export default function ProductsPage() {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { seller, isLoading: sellerLoading } = useSeller(address)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithSeller | null>(null)

  const { products, loading, refetch, deleteProduct } = useProducts({
    sellerId: seller?.id,
    category: category !== 'all' ? category : undefined,
    search: search || undefined,
    activeOnly: false,
  })

  const handleEdit = (product: ProductWithSeller) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm(t('product.deleteConfirm'))) return
    const success = await deleteProduct(productId)
    if (success) {
      toast.success(t('product.productDeleted'))
    } else {
      toast.error(t('errors.submitFailed'))
    }
  }

  const handleToggleStatus = async (product: ProductWithSeller) => {
    if (!seller?.id) return
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: seller.id,
          isActive: !product.isActive,
        }),
      })
      if (!response.ok) throw new Error('Failed to update')
      refetch()
      toast.success(product.isActive ? t('product.productSaved') : t('product.productSaved'))
    } catch {
      toast.error(t('errors.submitFailed'))
    }
  }

  const handleFormSuccess = () => {
    setEditingProduct(null)
    refetch()
    toast.success(editingProduct ? t('product.productSaved') : t('product.productSaved'))
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{t('seller.products')}</h1>
              <p className="text-muted-foreground">Product Management</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('order.searchOrders')}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryId | 'all')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('product.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link href="/sell/products/new">
                <Button className="gap-2 bg-coral hover:bg-coral/90">
                  <Plus className="h-4 w-4" />
                  {t('product.addProduct')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Content */}
          {loading || sellerLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-coral" />
            </div>
          ) : products.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">{t('product.noProducts')}</h2>
              <p className="text-muted-foreground mb-4">{t('product.addFirstProduct')}</p>
              <Link href="/sell/products/new">
                <Button className="gap-2 bg-coral hover:bg-coral/90">
                  <Plus className="h-4 w-4" />
                  {t('product.addProduct')}
                </Button>
              </Link>
            </Card>
          ) : (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </main>

      {seller && (
        <ProductForm
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editingProduct}
          sellerId={seller.id}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
