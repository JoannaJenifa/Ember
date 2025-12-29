'use client'

import { useState, useEffect } from 'react'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, Users, DollarSign, Gift, Star, RefreshCw } from 'lucide-react'
import { GiftRevenueCard } from '@/components/seller/gift-revenue-card'
import { Button } from '@/components/ui/button'
import { useAccount } from '@/lib/web3'
import { useTranslation } from '@/lib/i18n'

interface BlockchainStats {
  orders: { count: number; totalVolumeVery: number; confirmedCount: number }
  tips: { count: number; totalVolumeVery: number }
  gifts: { eventCount: number; totalQuantity: number; totalVolumeVery: number }
  reviews: { count: number; averageRating: string }
  dailyVolumes: Array<{
    date: string
    orderVolume: number
    tipVolume: number
    giftVolume: number
  }>
}

export default function AnalyticsPage() {
  const { address } = useAccount()
  const { t } = useTranslation()
  const [stats, setStats] = useState<BlockchainStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!address) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Filter stats by seller address
      const response = await fetch(`/api/subgraph/stats?seller=${address}`)
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.error || 'Failed to fetch blockchain data')
      }
    } catch (err) {
      setError('Failed to connect to blockchain indexer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [address])

  const statCards = stats ? [
    {
      label: t('analytics.totalSales'),
      value: `${stats.orders.totalVolumeVery} VERY`,
      change: `${stats.orders.count} orders`,
      icon: DollarSign,
    },
    {
      label: t('analytics.totalOrders'),
      value: stats.orders.confirmedCount.toString(),
      change: 'Confirmed',
      icon: TrendingUp,
    },
    {
      label: 'Tips Received',
      value: `${stats.tips.totalVolumeVery} VERY`,
      change: `${stats.tips.count} tips`,
      icon: Gift,
    },
    {
      label: 'Average Rating',
      value: `${stats.reviews.averageRating}`,
      change: `${stats.reviews.count} reviews`,
      icon: Star,
    },
  ] : []

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{t('analytics.title')}</h1>
              <p className="text-muted-foreground">Real-time blockchain analytics from TheGraph</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="bg-destructive/10 border-destructive/20 p-4 mb-8">
              <p className="text-destructive text-sm">{error}</p>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="bg-card border-border p-4">
                  <Skeleton className="h-5 w-5 mb-2" />
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </Card>
              ))
            ) : (
              statCards.map((stat) => (
                <Card key={stat.label} className="bg-card border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-5 w-5 text-coral" />
                    <span className="text-xs text-success">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))
            )}
          </div>

          {/* Gift & Tip Revenue Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('gift.giftRevenue')}</h2>
            <GiftRevenueCard streamerAddress={address} />
          </div>

          {/* Blockchain Activity */}
          {stats && (
            <Card className="bg-card border-border p-6 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Blockchain Activity</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Gifts Received</h3>
                  <p className="text-2xl font-bold text-coral">{stats.gifts.totalQuantity}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.gifts.totalVolumeVery} VERY total value
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tips Received</h3>
                  <p className="text-2xl font-bold text-coral">{stats.tips.count}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.tips.totalVolumeVery} VERY total
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">On-chain Reviews</h3>
                  <p className="text-2xl font-bold text-coral">{stats.reviews.count}</p>
                  <p className="text-sm text-muted-foreground">
                    Average: {stats.reviews.averageRating} stars
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Daily Volume Chart Placeholder */}
          {stats && stats.dailyVolumes.length > 0 ? (
            <Card className="bg-card border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Daily Volume (On-chain)</h2>
              <div className="space-y-3">
                {stats.dailyVolumes.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Orders: <span className="text-foreground font-medium">{day.orderVolume} VERY</span>
                      </span>
                      <span className="text-muted-foreground">
                        Tips: <span className="text-coral font-medium">{day.tipVolume} VERY</span>
                      </span>
                      <span className="text-muted-foreground">
                        Gifts: <span className="text-coral font-medium">{day.giftVolume} VERY</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : !loading && (
            <Card className="bg-card border-border p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">{t('analytics.noData')}</h2>
              <p className="text-muted-foreground">No blockchain activity indexed yet</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
