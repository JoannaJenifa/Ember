'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { OnchainOrderData } from '@/lib/hooks/use-onchain-orders'
import { formatDistanceToNow } from 'date-fns'

interface OnchainOrderCardProps {
  order: OnchainOrderData
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  REFUNDED: {
    label: 'Refunded',
    icon: XCircle,
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
  DISPUTED: {
    label: 'Disputed',
    icon: AlertTriangle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

export function OnchainOrderCard({ order }: OnchainOrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
  const StatusIcon = statusConfig.icon
  const explorerUrl = `https://www.veryscan.io/tx/${order.txHash}`

  return (
    <Card className="bg-card border-border p-4 hover:border-coral/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8)}...
            </span>
            <Badge variant="outline" className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-coral">{order.amountFormatted} VERY</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Product ID:</span>
              <span className="font-mono text-xs">{order.productId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Buyer:</span>
              <span className="font-mono text-xs truncate max-w-[200px]">{order.buyer}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Seller:</span>
              <span className="font-mono text-xs truncate max-w-[200px]">{order.seller}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-coral hover:underline flex items-center gap-1"
          >
            View on Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(order.createdAtDate), { addSuffix: true })}
          </span>
          {order.confirmedAtDate && (
            <span className="text-xs text-green-500">
              Confirmed {formatDistanceToNow(new Date(order.confirmedAtDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
