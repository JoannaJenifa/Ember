'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, ShoppingCart, Shirt, Sparkles, UtensilsCrossed, Smartphone, Sofa, Dumbbell } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import Link from 'next/link'
import { getActiveProducts, type SubgraphProduct } from '@/lib/services/subgraph'

const CATEGORIES = [
  { id: 'all', labelKey: 'common.all', icon: null },
  { id: 'fashion', labelKey: 'categories.fashion', icon: Shirt },
  { id: 'beauty', labelKey: 'categories.beauty', icon: Sparkles },
  { id: 'food', labelKey: 'categories.food', icon: UtensilsCrossed },
  { id: 'electronics', labelKey: 'categories.electronics', icon: Smartphone },
  { id: 'home', labelKey: 'categories.home', icon: Sofa },
  { id: 'sports', labelKey: 'categories.sports', icon: Dumbbell },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

interface ProductMetadata {
  titleKo?: string
  description?: string
  descriptionKo?: string
  images?: string[]
}

function parseMetadata(metadataURI: string): ProductMetadata {
  if (!metadataURI) return {}
  try {
    return JSON.parse(metadataURI)
  } catch {
    return {}
  }
}

export default function ProductsPage() {
  const { t, locale } = useTranslation()
  const [products, setProducts] = useState<SubgraphProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<CategoryId>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const data = await getActiveProducts(100)
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (category !== 'all' && product.category !== category) return false
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const metadata = parseMetadata(product.metadataURI)
        const matchesTitle = product.title.toLowerCase().includes(searchLower)
        const matchesTitleKo = metadata.titleKo?.toLowerCase().includes(searchLower)
        if (!matchesTitle && !matchesTitleKo) return false
      }
      return true
    })
  }, [products, category, search])

  const formatPrice = (priceWei: string) => {
    // Convert from wei (18 decimals) to VERY
    const priceInVery = parseFloat(priceWei) / 1e18
    if (priceInVery < 0.001) return `${priceInVery.toFixed(6)} VERY`
    if (priceInVery < 1) return `${priceInVery.toFixed(4)} VERY`
    return `${priceInVery.toFixed(2)} VERY`
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('products.title')}</h1>
            <p className="text-muted-foreground">{t('products.subtitle')}</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('categories.search')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={cat.id === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className={cat.id === category ? 'bg-coral hover:bg-coral/90' : ''}
            >
              {t(cat.labelKey)}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const metadata = parseMetadata(product.metadataURI)
              const images = metadata.images || []
              const displayTitle = locale === 'ko' && metadata.titleKo ? metadata.titleKo : product.title
              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="bg-card border-border overflow-hidden hover:border-coral/50 transition-colors cursor-pointer h-full">
                    {/* Product Image */}
                    <div className="aspect-square bg-muted relative">
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={displayTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {product.inventory && parseInt(product.inventory) < 10 && (
                        <Badge className="absolute top-2 right-2 bg-orange-500">
                          {t('product.lowStock')}
                        </Badge>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                        {displayTitle}
                      </h3>
                      {product.seller && (
                        <p className="text-xs text-muted-foreground mb-2 truncate">
                          {product.seller.shopName}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-coral font-semibold text-sm">
                          {formatPrice(product.priceVery)}
                        </span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('categories.noProducts')}
            </h2>
            <p className="text-muted-foreground">
              {t('categories.noProductsDesc')}
            </p>
          </Card>
        )}
      </div>
    </main>
  )
}
