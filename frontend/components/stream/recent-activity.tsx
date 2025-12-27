'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Gift, Heart, ExternalLink, RefreshCw, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnchainTips } from '@/lib/hooks/use-onchain-tips'
import { useOnchainGifts } from '@/lib/hooks/use-onchain-gifts'
import { useOnchainOrders } from '@/lib/hooks/use-onchain-orders'
import { useTranslation } from '@/lib/i18n'
import { formatVeryPrice } from '@/lib/utils/format'
import type { ProductWithSeller } from '@/lib/types/product'
import type { Address } from 'viem'

const EXPLORER_URL = 'https://sepolia.basescan.org/tx/'

interface RecentPurchase {
  txHash: string
  product: ProductWithSeller
}

interface RecentTip {
  txHash: string
  amount: string
  message?: string
  streamerId: Address
}

interface RecentActivityProps {
  streamerAddress?: string
  recentPurchase?: RecentPurchase | null
  recentTip?: RecentTip | null
}

export function RecentActivity({ streamerAddress, recentPurchase, recentTip }: RecentActivityProps) {
  const { t } = useTranslation()
  const { tips, loading: tipsLoading, refetch: refetchTips } = useOnchainTips({
    streamerAddress,
    first: 5,
  })
  const { gifts, loading: giftsLoading, refetch: refetchGifts } = useOnchainGifts({
    streamerAddress,
    first: 5,
  })
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOnchainOrders({
    sellerAddress: streamerAddress,
    first: 5,
  })

  const loading = tipsLoading || giftsLoading || ordersLoading

  const handleRefresh = () => {
    refetchTips()
    refetchGifts()
    refetchOrders()
  }

  // Combine and sort by timestamp
  const activities = [
    ...tips.map((t) => ({ ...t, type: 'tip' as const })),
    ...gifts.map((g) => ({ ...g, type: 'gift' as const })),
    ...orders.map((o) => ({ ...o, type: 'order' as const })),
    // Add recent purchase if exists (optimistic update before subgraph syncs)
    ...(recentPurchase ? [{
      id: recentPurchase.txHash,
      type: 'purchase' as const,
      txHash: recentPurchase.txHash,
      product: recentPurchase.product,
      createdAtDate: new Date().toISOString(),
    }] : []),
    // Add recent tip if exists (optimistic update before subgraph syncs)
    ...(recentTip ? [{
      id: recentTip.txHash,
      type: 'optimistic-tip' as const,
      txHash: recentTip.txHash,
      amountVery: recentTip.amount,
      message: recentTip.message,
      from: 'You',
      createdAtDate: new Date().toISOString(),
    }] : []),
  ].sort((a, b) => new Date(b.createdAtDate).getTime() - new Date(a.createdAtDate).getTime())
  .slice(0, 5)

  if (loading) {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-6" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-coral" />
          <h2 className="font-semibold">{t('stream.onchainActivity')}</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t('stream.noActivity')}</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </Card>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  const isTip = activity.type === 'tip' || activity.type === 'optimistic-tip'
  const isGift = activity.type === 'gift'
  const isPurchase = activity.type === 'purchase'
  const isOrder = activity.type === 'order'

  const Icon = (isPurchase || isOrder) ? ShoppingBag : isTip ? Heart : Gift
  const iconColor = (isPurchase || isOrder) ? 'text-green-500' : isTip ? 'text-pink-500' : 'text-amber-500'
  const explorerUrl = `${EXPLORER_URL}${activity.txHash}`

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          {isPurchase ? (
            <>
              <span className="text-muted-foreground">Purchased</span>
              <Badge variant="outline" className="text-xs">
                {activity.product?.descriptionKo || activity.product?.title}
              </Badge>
            </>
          ) : isOrder ? (
            <>
              <span className="font-mono text-xs truncate max-w-[80px]">
                {activity.buyer?.slice(0, 6)}...
              </span>
              <span className="text-muted-foreground">ordered</span>
              <Badge variant="outline" className="text-xs">
                {activity.amountFormatted} VERY
              </Badge>
            </>
          ) : (
            <>
              <span className="font-mono text-xs truncate max-w-[80px]">
                {activity.from?.slice(0, 6)}...
              </span>
              <span className="text-muted-foreground">sent</span>
              {isTip ? (
                <Badge variant="outline" className="text-xs">{activity.amountFormatted || activity.amountVery} VERY</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">{activity.quantity}x {activity.gift?.name}</Badge>
              )}
            </>
          )}
        </div>
        {activity.message && (
          <p className="text-xs text-muted-foreground truncate">{activity.message}</p>
        )}
        {isPurchase && activity.product?.priceVery && (
          <p className="text-xs text-coral font-medium">
            {formatVeryPrice(activity.product.priceVery)} VERY
          </p>
        )}
      </div>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-coral">
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
