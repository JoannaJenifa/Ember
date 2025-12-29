'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClipboardList, Package, Search, Loader2, Link as LinkIcon, RefreshCw } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useOrders } from '@/lib/hooks/use-orders'
import { useOnchainOrders } from '@/lib/hooks/use-onchain-orders'
import { useConfirmDelivery, useDisputeOrder } from '@/lib/web3/order-escrow'
import { OrderCard } from '@/components/order/order-card'
import { OnchainOrderCard } from '@/components/order/onchain-order-card'
import { OrderStatus } from '@/lib/types/order'
import { useTranslation } from '@/lib/i18n'
import Link from 'next/link'

export default function OrdersPage() {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Fetch orders for the connected wallet (Supabase)
  const { orders, loading, refetch } = useOrders({
    buyerAddress: address,
  })

  // Fetch on-chain orders from subgraph
  const {
    orders: onchainOrders,
    loading: onchainLoading,
    refetch: refetchOnchain,
  } = useOnchainOrders({
    buyerAddress: address,
  })

  const { confirmDelivery, loading: confirmLoading } = useConfirmDelivery()
  const { disputeOrder, loading: disputeLoading } = useDisputeOrder()

  // Filter orders based on tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return order.status === 'pending'
    if (activeTab === 'shipping') return order.status === 'shipped'
    if (activeTab === 'completed') return order.status === 'delivered'
    if (activeTab === 'disputed') return order.status === 'disputed'
    return true
  }).filter((order) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      order.product?.title?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    )
  })

  const handleConfirmDelivery = async (orderId: string, onchainOrderId: string) => {
    if (!onchainOrderId) return
    const result = await confirmDelivery(onchainOrderId as `0x${string}`)
    if (result) {
      // Update order status in database
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      })
      refetch()
    }
  }

  const handleDispute = async (orderId: string, onchainOrderId: string) => {
    if (!onchainOrderId) return
    const reason = prompt(t('order.disputeReason') || 'Enter dispute reason:')
    if (!reason) return

    const result = await disputeOrder(onchainOrderId as `0x${string}`, reason)
    if (result) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disputed' }),
      })
      refetch()
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-card border-border p-12 text-center max-w-md mx-auto">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">{t('register.walletRequired')}</h2>
            <p className="text-muted-foreground mb-4">{t('errors.walletNotConnected')}</p>
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
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('order.myOrders')}</h1>
            <p className="text-muted-foreground">My Orders</p>
          </div>
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('order.status.pending')}</TabsTrigger>
            <TabsTrigger value="shipping">{t('order.status.shipped')}</TabsTrigger>
            <TabsTrigger value="completed">{t('order.status.delivered')}</TabsTrigger>
            <TabsTrigger value="disputed">{t('order.status.disputed') || 'Disputed'}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-20 w-20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {t('order.noOrders')}
                </h2>
                <p className="text-muted-foreground mb-4">{t('order.noOrdersDesc')}</p>
                <Button className="gap-2 bg-coral hover:bg-coral/90" asChild>
                  <Link href="/">
                    <Package className="h-4 w-4" />
                    {t('hero.watchLive')}
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {(confirmLoading || disputeLoading) && (
                  <Card className="p-4 bg-amber-500/10 border-amber-500/20 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-amber-500 text-sm">{t('common.loading')}</span>
                  </Card>
                )}
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onConfirmDelivery={() =>
                      handleConfirmDelivery(order.id, order.onchain_order_id || '')
                    }
                    onDispute={() =>
                      handleDispute(order.id, order.onchain_order_id || '')
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* On-Chain Orders Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-coral" />
              <h2 className="text-lg font-semibold text-foreground">Blockchain Orders</h2>
              <span className="text-sm text-muted-foreground">(from TheGraph)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchOnchain}
              disabled={onchainLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${onchainLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {onchainLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : onchainOrders.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <LinkIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No blockchain orders indexed yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {onchainOrders.map((order) => (
                <OnchainOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
