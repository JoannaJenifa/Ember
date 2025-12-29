'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Radio, TrendingUp, DollarSign, Plus, Star } from 'lucide-react'
import type { SubgraphSeller } from '@/lib/graphql/seller-queries'
import { useTranslation } from '@/lib/i18n'
import { useMemo } from 'react'
import { useSellerStats } from '@/lib/hooks/use-seller-stats'
import { useSellerRevenue } from '@/lib/hooks/use-seller-revenue'

interface SellerDashboardProps {
  seller: SubgraphSeller
}

// Parse metadata from subgraph seller
function parseMetadata(metadataURI: string): {
  shopNameKo?: string
  description?: string
  profileImage?: string
  bannerImage?: string
} {
  try {
    return JSON.parse(metadataURI)
  } catch {
    return {}
  }
}

// Format revenue with proper decimal handling
function formatRevenue(amount: number): string {
  if (amount === 0) return '0'
  if (amount < 0.001) return '<0.001'
  if (amount < 0.01) return amount.toFixed(4)
  return amount.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function SellerDashboard({ seller }: SellerDashboardProps) {
  const { t } = useTranslation()
  const { stats: sellerStats } = useSellerStats(seller.wallet)
  const { revenue } = useSellerRevenue(seller.wallet)

  const metadata = useMemo(() => parseMetadata(seller.metadataURI), [seller.metadataURI])

  // Format rating display
  const ratingDisplay = sellerStats?.avgRating
    ? `${sellerStats.avgRating.toFixed(1)} (${sellerStats.totalReviews})`
    : '-'

  // Use revenue from orders (calculated from subgraph) instead of seller.totalSales
  const revenueDisplay = revenue
    ? `${formatRevenue(revenue.totalRevenueFormatted)} VERY`
    : '0 VERY'

  const stats = [
    { labelKey: 'dashboard.totalProducts', value: seller.products?.length?.toString() || '0', icon: Package },
    { labelKey: 'dashboard.liveStreams', value: sellerStats?.liveStreamsCount?.toString() || '0', icon: Radio },
    { labelKey: 'dashboard.monthlyRevenue', value: revenueDisplay, icon: DollarSign },
    { labelKey: 'dashboard.avgRating', value: ratingDisplay, icon: Star },
  ]

  return (
    <div>
      {/* Banner Image */}
      <div className="relative h-40 bg-gradient-to-r from-coral/20 to-coral/5">
        {metadata.bannerImage ? (
          <img
            src={metadata.bannerImage}
            alt={`${seller.shopName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {t('seller.bannerImage')} - <Link href="/sell/profile" className="text-coral hover:underline">{t('common.edit')}</Link>
            </p>
          </div>
        )}
        {/* Profile Image Overlay */}
        <div className="absolute -bottom-8 left-6">
          {metadata.profileImage ? (
            <img
              src={metadata.profileImage}
              alt={seller.shopName}
              className="w-20 h-20 rounded-full object-cover border-4 border-background"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-coral/10 border-4 border-background flex items-center justify-center text-3xl">
              🏪
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{seller.shopName}</h1>
            <p className="text-muted-foreground">
              {metadata.shopNameKo || t('dashboard.sellerDashboard')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/sell/products/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dashboard.addProduct')}
              </Button>
            </Link>
            <Link href="/sell/streams/new">
              <Button className="gap-2 bg-coral hover:bg-coral/90">
                <Radio className="h-4 w-4" />
                {t('dashboard.startStream')}
              </Button>
            </Link>
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.labelKey} className="bg-card border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-coral/10">
                <stat.icon className="h-5 w-5 text-coral" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickStart')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/sell/products/new">
            <Card className="bg-card border-border p-6 hover:border-coral/50 transition-colors cursor-pointer h-full">
              <Package className="h-8 w-8 text-coral mb-3" />
              <h3 className="font-semibold mb-1">{t('dashboard.registerProduct.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.registerProduct.desc')}</p>
            </Card>
          </Link>
          <Link href="/sell/streams/new">
            <Card className="bg-card border-border p-6 hover:border-coral/50 transition-colors cursor-pointer h-full">
              <Radio className="h-8 w-8 text-coral mb-3" />
              <h3 className="font-semibold mb-1">{t('dashboard.scheduleStream.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.scheduleStream.desc')}</p>
            </Card>
          </Link>
          <Link href="/sell/analytics">
            <Card className="bg-card border-border p-6 hover:border-coral/50 transition-colors cursor-pointer h-full">
              <TrendingUp className="h-8 w-8 text-coral mb-3" />
              <h3 className="font-semibold mb-1">{t('dashboard.viewAnalytics.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('dashboard.viewAnalytics.desc')}</p>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Activity Placeholder */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.recentActivity')}</h2>
        <Card className="bg-card border-border p-8 text-center">
          <p className="text-muted-foreground">{t('dashboard.noActivity')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('dashboard.noActivityDesc')}
          </p>
        </Card>
      </section>
      </div>
    </div>
  )
}
