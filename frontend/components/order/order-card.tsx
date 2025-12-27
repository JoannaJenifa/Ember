'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrderWithDetails, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types/order'
import { Package, Truck, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

interface OrderCardProps {
  order: OrderWithDetails
  isSeller?: boolean
  onConfirmDelivery?: () => void
  onDispute?: () => void
  onShip?: () => void
}

export function OrderCard({
  order,
  isSeller = false,
  onConfirmDelivery,
  onDispute,
  onShip,
}: OrderCardProps) {
  const { t } = useTranslation()
  const status = (order.status || 'pending') as keyof typeof ORDER_STATUS_LABELS
  const statusLabel = ORDER_STATUS_LABELS[status]
  const statusColor = ORDER_STATUS_COLORS[status]

  const timeAgo = order.createdAt
    ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ko })
    : ''

  const StatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'disputed':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Card className="p-4 bg-card hover:bg-card/80 transition-colors">
      <Link href={`/orders/${order.id}`} className="block">
        <div className="flex gap-4">
          {/* Product Image */}
          {order.productImage ? (
            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={order.productImage}
                alt={order.product?.title || ''}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">
                {order.product?.title || t('order.product')}
              </h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {t('order.quantity')}: {order.quantity} · {timeAgo}
            </p>

            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={`gap-1 ${statusColor}`}
              >
                <StatusIcon />
                {statusLabel?.ko}
              </Badge>
              <span className="text-coral font-bold">
                {order.totalVery || order.total_price_very || '0'} VERY
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      {!isSeller && (status === 'shipped' || status === 'pending') && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {status === 'shipped' && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                e.preventDefault()
                onConfirmDelivery?.()
              }}
            >
              {t('order.confirmDelivery')}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault()
              onDispute?.()
            }}
          >
            {t('order.cancelOrder')}
          </Button>
        </div>
      )}

      {isSeller && status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            size="sm"
            className="flex-1 bg-coral hover:bg-coral/90"
            onClick={(e) => {
              e.preventDefault()
              onShip?.()
            }}
          >
            {t('order.status.shipped')}
          </Button>
        </div>
      )}
    </Card>
  )
}
