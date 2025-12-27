'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderWithDetails, ORDER_STATUS_LABELS } from '@/lib/types/order'
import { CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { getExplorerUrl } from '@/lib/web3'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'

interface OrderConfirmationProps {
  order: OrderWithDetails
  txHash: string
  chainId?: number
  onViewOrders?: () => void
}

export function OrderConfirmation({
  order,
  txHash,
  chainId = 4613, // VeryChain
  onViewOrders,
}: OrderConfirmationProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyTxHash = async () => {
    await navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = getExplorerUrl(chainId)
  const txUrl = `${explorerUrl}/tx/${txHash}`
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">{t('order.orderConfirmation')}</h2>
        <p className="text-muted-foreground">Order Complete</p>
      </div>

      {/* Order ID */}
      <Card className="p-4 bg-card/50">
        <div className="text-sm text-muted-foreground mb-1">{t('order.orderNumber')}</div>
        <div className="font-mono text-foreground">{order.id.slice(0, 8)}...{order.id.slice(-8)}</div>
      </Card>

      {/* Product Info */}
      {order.product && (
        <Card className="p-4 bg-card/50">
          <div className="flex gap-4 text-left">
            {order.productImage && (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={order.productImage}
                  alt={order.product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {order.product.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('order.quantity')}: {order.quantity}
              </p>
              <p className="text-coral font-medium">
                {order.totalVery || order.total_price_very || '0'} VERY
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Status */}
      <div className="flex justify-between items-center py-2">
        <span className="text-muted-foreground">{t('order.status.pending')}</span>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
          {statusLabel?.ko || order.status}
        </Badge>
      </div>

      {/* Transaction Hash */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">{t('order.trackingNumber')}</div>
        <div className="flex items-center gap-2 justify-center">
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </code>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTxHash}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href={txUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Shipping Info */}
      {order.shipping_name && (
        <Card className="p-4 bg-card/50 text-left">
          <div className="text-sm font-medium text-foreground mb-2">{t('order.shippingInfo')}</div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{order.shipping_name}</p>
            <p>{order.shipping_phone}</p>
            <p>{order.shipping_address}</p>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/">{t('common.goBack')}</Link>
        </Button>
        <Button
          className="flex-1 bg-coral hover:bg-coral/90"
          onClick={onViewOrders}
          asChild
        >
          <Link href="/orders">{t('order.viewDetails')}</Link>
        </Button>
      </div>
    </div>
  )
}
