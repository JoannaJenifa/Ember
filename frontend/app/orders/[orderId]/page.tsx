'use client'

import { use } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useOrder } from '@/lib/hooks/use-orders'
import { useConfirmDelivery, useDisputeOrder } from '@/lib/web3/order-escrow'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types/order'
import { getExplorerUrl } from '@/lib/web3'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { t } = useTranslation()
  const { orderId } = use(params)
  const { order, loading, refetch } = useOrder(orderId)
  const { confirmDelivery, loading: confirmLoading } = useConfirmDelivery()
  const { disputeOrder, loading: disputeLoading } = useDisputeOrder()
  const [copied, setCopied] = useState(false)

  const status = (order?.status || 'pending') as keyof typeof ORDER_STATUS_LABELS
  const statusLabel = ORDER_STATUS_LABELS[status]
  const statusColor = ORDER_STATUS_COLORS[status]
  const explorerUrl = getExplorerUrl(4613) // VeryChain

  const copyTxHash = async () => {
    if (!order?.txHash) return
    await navigator.clipboard.writeText(order.txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmDelivery = async () => {
    if (!order?.onchain_order_id) return
    const result = await confirmDelivery(order.onchain_order_id as `0x${string}`)
    if (result) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      })
      refetch()
    }
  }

  const handleDispute = async () => {
    if (!order?.onchain_order_id) return
    const reason = prompt(t('order.disputeReason'))
    if (!reason) return
    const result = await disputeOrder(order.onchain_order_id as `0x${string}`, reason)
    if (result) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disputed' }),
      })
      refetch()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card className="p-6 space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">{t('errors.notFound')}</h1>
          <Button asChild>
            <Link href="/orders">{t('common.goBack')}</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('order.viewDetails')}</h1>
            <p className="text-sm text-muted-foreground">Order Details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline" className={`gap-1 ${statusColor}`}>
                {status === 'pending' && <Package className="h-3 w-3" />}
                {status === 'shipped' && <Truck className="h-3 w-3" />}
                {status === 'delivered' && <CheckCircle className="h-3 w-3" />}
                {status === 'disputed' && <AlertTriangle className="h-3 w-3" />}
                {statusLabel?.ko}
              </Badge>
              {order.createdAt && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                </span>
              )}
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between">
              {['pending', 'shipped', 'delivered'].map((s, i) => {
                const steps = ['pending', 'shipped', 'delivered']
                const currentIdx = steps.indexOf(status)
                const isComplete = i <= currentIdx
                const isCurrent = i === currentIdx
                return (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-coral text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i === 0 && <Package className="h-4 w-4" />}
                      {i === 1 && <Truck className="h-4 w-4" />}
                      {i === 2 && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]?.ko}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Product Info */}
          <Card className="p-6">
            <h2 className="font-medium text-foreground mb-4">{t('order.product')}</h2>
            <div className="flex gap-4">
              {order.productImage ? (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={order.productImage} alt={order.product.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{order.product?.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('order.quantity')}: {order.quantity}{t('product.stockCount', { count: '' }).replace(/\d+/, '')}</p>
                <p className="text-lg font-bold text-coral mt-2">
                  {order.totalVery || order.total_price_very || '0'} VERY
                </p>
              </div>
            </div>
          </Card>

          {/* Shipping Info */}
          {order.shipping_name && (
            <Card className="p-6">
              <h2 className="font-medium text-foreground mb-4">{t('order.shippingInfo')}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /><span>{order.shipping_name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /><span>{order.shipping_phone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" /><span>{order.shipping_address}</span>
                </div>
                {order.tracking_number && (
                  <div className="pt-3 border-t border-border">
                    <span className="text-foreground font-medium">{t('order.trackingNumber')}:</span>
                    <span className="ml-2">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Transaction Info */}
          {order.txHash && (
            <Card className="p-6">
              <h2 className="font-medium text-foreground mb-4">{t('wallet.transactions')}</h2>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {order.txHash.slice(0, 16)}...{order.txHash.slice(-12)}
                </code>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTxHash}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`${explorerUrl}/tx/${order.txHash}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          {status !== 'delivered' && status !== 'refunded' && (
            <div className="flex gap-3">
              {status === 'shipped' && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmDelivery}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? t('common.processing') : t('order.confirmDelivery')}
                </Button>
              )}
              {status !== 'disputed' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDispute}
                  disabled={disputeLoading}
                >
                  {disputeLoading ? t('common.processing') : t('order.status.disputed')}
                </Button>
              )}
            </div>
          )}

          {status === 'delivered' && (
            <Button className="w-full bg-coral hover:bg-coral/90 gap-2" asChild>
              <Link href={`/product/${order.product?.id}`}>
                <Star className="h-4 w-4" />{t('review.writeReview')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
