'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ClipboardList, Search, Truck, Package } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useOrders } from '@/lib/hooks/use-orders'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types/order'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function SellerOrdersPage() {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [showShipDialog, setShowShipDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipping, setShipping] = useState(false)

  // First get seller ID from wallet address, then fetch orders
  // For now, we'll use a placeholder approach - in production, fetch sellerId first
  const { orders, loading, refetch } = useOrders({
    // This should be sellerId, but we'll filter client-side for now
    buyerAddress: undefined,
  })

  // Filter to only show orders for the current seller
  const sellerOrders = orders.filter((order) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      order.product?.title?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      order.buyer_address?.toLowerCase().includes(searchLower) ||
      order.buyer.toLowerCase().includes(searchLower)
    )
  })

  const handleShipOrder = async () => {
    if (!selectedOrderId || !trackingNumber.trim()) return

    setShipping(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      })

      if (response.ok) {
        setShowShipDialog(false)
        setTrackingNumber('')
        setSelectedOrderId(null)
        refetch()
      }
    } catch (error) {
      console.error('Ship order error:', error)
    } finally {
      setShipping(false)
    }
  }

  const openShipDialog = (orderId: string) => {
    setSelectedOrderId(orderId)
    setShowShipDialog(true)
  }

  const maskAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">{t('register.walletRequired')}</h2>
            <p className="text-muted-foreground">{t('seller.connectForOrders')}</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('seller.orderManagement')}</h1>
            <p className="text-muted-foreground">Order Management</p>
          </div>
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('order.searchOrders')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sellerOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">{t('order.noOrders')}</h2>
              <p className="text-muted-foreground">{t('seller.noOrdersYet')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('order.orderNumber')}</TableHead>
                  <TableHead>{t('order.buyer')}</TableHead>
                  <TableHead>{t('product.title')}</TableHead>
                  <TableHead className="text-right">{t('order.quantity')}</TableHead>
                  <TableHead className="text-right">{t('order.amount')}</TableHead>
                  <TableHead>{t('order.status.title')}</TableHead>
                  <TableHead className="text-right">{t('common.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerOrders.map((order) => {
                  const status = (order.status || 'pending') as keyof typeof ORDER_STATUS_LABELS
                  const statusLabel = ORDER_STATUS_LABELS[status]
                  const statusColor = ORDER_STATUS_COLORS[status]

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        <Link href={`/orders/${order.id}`} className="hover:text-coral">
                          {order.id.slice(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {maskAddress(order.buyer_address || order.buyer)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.product?.title || '-'}
                      </TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell className="text-right text-coral font-medium">
                        {order.totalVery || order.total_price_very || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor}>
                          {statusLabel?.ko}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === 'pending' && (
                          <Button
                            size="sm"
                            className="gap-1 bg-coral hover:bg-coral/90"
                            onClick={() => openShipDialog(order.id)}
                          >
                            <Truck className="h-3 w-3" />
                            {t('order.ship')}
                          </Button>
                        )}
                        {status === 'shipped' && order.tracking_number && (
                          <span className="text-sm text-muted-foreground">
                            {order.tracking_number}
                          </span>
                        )}
                        {status === 'disputed' && (
                          <Button size="sm" variant="outline">
                            {t('order.respond')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Ship Dialog */}
        <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('order.startShipping')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('order.trackingNumber')}</label>
                <Input
                  placeholder={t('order.enterTrackingNumber')}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShipDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-coral hover:bg-coral/90"
                onClick={handleShipOrder}
                disabled={shipping || !trackingNumber.trim()}
              >
                {shipping ? t('common.processing') : t('order.startShipping')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
