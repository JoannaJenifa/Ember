'use client'

import { Card } from '@/components/ui/card'
import { Users, ShoppingBag, Coins, Gift, MessageCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface LiveStatsProps {
  viewerCount: number
  orderCount: number
  revenue: number
  giftCount: number
  chatCount?: number
}

export function LiveStats({
  viewerCount,
  orderCount,
  revenue,
  giftCount,
  chatCount = 0,
}: LiveStatsProps) {
  const { t } = useTranslation()

  const stats = [
    {
      label: t('stream.viewers'),
      value: viewerCount.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: t('order.myOrders'),
      value: orderCount.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-green-500',
    },
    {
      label: t('seller.totalSales'),
      value: `${revenue.toLocaleString()} VERY`,
      icon: Coins,
      color: 'text-yellow-500',
    },
    {
      label: t('gift.gifts'),
      value: giftCount.toLocaleString(),
      icon: Gift,
      color: 'text-pink-500',
    },
  ]

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('analytics.overview')}</h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
