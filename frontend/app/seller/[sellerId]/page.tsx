'use client'

import { use, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MapPin, Radio } from 'lucide-react'
import { getCategoryLabel, getCategoryIcon } from '@/components/seller/seller-categories'
import type { LabangSeller } from '@/lib/db/supabase'
import { useTranslation } from '@/lib/i18n'

interface SellerPageProps {
  params: Promise<{ sellerId: string }>
}

export default function SellerPage({ params }: SellerPageProps) {
  const { t } = useTranslation()
  const { sellerId } = use(params)
  const [seller, setSeller] = useState<LabangSeller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSeller() {
      try {
        const response = await fetch(`/api/sellers/${sellerId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError(t('errors.notFound'))
            return
          }
          throw new Error('Failed to fetch seller')
        }
        const data = await response.json()
        setSeller(data)
      } catch (err) {
        setError(t('errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeller()
  }, [sellerId])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <Skeleton className="h-32 w-full" />
        <div className="max-w-4xl mx-auto px-6 -mt-12">
          <div className="flex items-end gap-4 mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error || !seller) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-xl font-semibold mb-2">{error || t('errors.notFound')}</p>
          <p className="text-muted-foreground">Seller not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-coral/30 to-coral/10">
        {seller.banner_image && (
          <img
            src={seller.banner_image}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 mb-8">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {seller.profile_image ? (
              <img
                src={seller.profile_image}
                alt={seller.shop_name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-coral/10 border-4 border-background flex items-center justify-center text-4xl">
                {getCategoryIcon(seller.category)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-16 md:pt-20">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{seller.shop_name}</h1>
              {/* Live badge - TODO: check if streaming */}
              {false && (
                <Badge className="bg-red-500 text-white gap-1">
                  <Radio className="h-3 w-3" />
                  LIVE
                </Badge>
              )}
            </div>
            {seller.shop_name_ko && (
              <p className="text-muted-foreground mb-2">{seller.shop_name_ko}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-coral">
                <span>{getCategoryIcon(seller.category)}</span>
                <span>{getCategoryLabel(seller.category)}</span>
              </span>
              {seller.kyc_verified && (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {t('seller.verified')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {seller.description && (
          <Card className="p-6 bg-card border-border mb-8">
            <h2 className="font-semibold mb-2">{t('seller.description')}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{seller.description}</p>
          </Card>
        )}

        {/* Products Grid - Placeholder */}
        <section>
          <h2 className="text-xl font-bold mb-4">{t('seller.products')}</h2>
          <Card className="p-8 text-center bg-card border-border">
            <p className="text-muted-foreground">{t('product.noProducts')}</p>
          </Card>
        </section>
      </div>
    </div>
  )
}
