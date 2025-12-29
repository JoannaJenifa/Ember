'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Heart, Share2, ShoppingBag, MessageCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { VideoPlayer } from '@/components/stream/video-player'
import { LiveBadge } from '@/components/stream/live-badge'
import { ProductSidebar } from '@/components/stream/product-sidebar'
import { ProductQuickView } from '@/components/stream/product-quick-view'
import { StreamChat } from '@/components/stream/stream-chat'
import { ChatInput } from '@/components/stream/chat-input'
import { GiftButton } from '@/components/stream/gift-button'
import { TipButton, type TipData } from '@/components/tips/tip-button'
import { WatchEarningsWrapper } from '@/components/earn'
import { RecentActivity } from '@/components/stream/recent-activity'
import { PurchaseModal, type PurchaseDetails } from '@/components/order/purchase-modal'
import { useStream } from '@/lib/hooks/use-stream'
import { useAccount, usePublicClient } from '@/lib/web3'
import { useCreateOrder } from '@/lib/web3/order-escrow'
import { useTranslation } from '@/lib/i18n'
import type { ProductWithSeller } from '@/lib/types/product'
import type { Address } from 'viem'

const EXPLORER_URL = 'https://sepolia.basescan.org/tx/'

interface StreamPageProps {
  params: Promise<{ streamId: string }>
}

export default function StreamPage({ params }: StreamPageProps) {
  const { streamId } = use(params)
  const { stream, loading, error } = useStream(streamId)
  const { address, isConnected } = useAccount()
  const { publicClient } = usePublicClient()
  const { t } = useTranslation()
  const { createOrder } = useCreateOrder()
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [purchaseProduct, setPurchaseProduct] = useState<ProductWithSeller | null>(null)
  const [recentPurchase, setRecentPurchase] = useState<{ txHash: string; product: ProductWithSeller } | null>(null)
  const [recentTip, setRecentTip] = useState<TipData | null>(null)

  // Track viewer join/leave for viewer count
  useEffect(() => {
    if (!stream || stream.status !== 'live') return

    // Increment viewer count when entering the page
    const joinStream = async () => {
      try {
        await fetch(`/api/streams/${streamId}/viewers`, { method: 'POST' })
      } catch (error) {
        console.error('Failed to join stream:', error)
      }
    }

    // Decrement viewer count when leaving the page
    const leaveStream = async () => {
      try {
        await fetch(`/api/streams/${streamId}/viewers`, { method: 'DELETE' })
      } catch (error) {
        console.error('Failed to leave stream:', error)
      }
    }

    joinStream()

    // Handle page unload (closing tab, navigating away)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page unload
      navigator.sendBeacon(`/api/streams/${streamId}/viewers?_method=DELETE`)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      leaveStream()
    }
  }, [stream?.status, streamId])

  const handleProductClick = (product: ProductWithSeller) => {
    setSelectedProduct(product)
    setQuickViewOpen(true)
  }

  const handleQuickBuy = (product: ProductWithSeller) => {
    // Go directly to purchase modal (skip the sheet)
    setPurchaseProduct(product)
    setPurchaseModalOpen(true)
  }

  const handlePurchase = useCallback((product: ProductWithSeller) => {
    // Close quick view first
    setQuickViewOpen(false)
    // Then open purchase modal
    setPurchaseProduct(product)
    setPurchaseModalOpen(true)
  }, [])

  const handleTipSuccess = useCallback((tip: TipData) => {
    setRecentTip(tip)
  }, [])

  const handleConfirmPurchase = useCallback(async (details: PurchaseDetails) => {
    if (!address || !details.product.seller) {
      toast.error(t('common.error'), { description: t('wallet.connectFirst') })
      return
    }

    // Show loading toast
    const loadingToast = toast.loading(t('order.processingPayment'))

    try {
      // Convert from wei to VERY (18 decimals)
      const priceInVery = parseFloat(details.product.priceVery) / 1e18
      const totalAmount = priceInVery * details.quantity

      // Create order on chain
      const result = await createOrder({
        seller: details.product.seller.wallet as Address,
        productId: details.product.id,
        amount: totalAmount,
      })

      if (!result) {
        throw new Error(t('errors.submitFailed'))
      }

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: result.txHash as `0x${string}` })
      }

      // Save to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onchainOrderId: result.orderId,
          buyerAddress: address,
          sellerId: details.product.seller.wallet, // Use wallet address for DB lookup
          productId: details.product.id,
          quantity: details.quantity,
          totalPriceVery: totalAmount,
          shippingName: details.shipping.name,
          shippingPhone: details.shipping.phone,
          shippingAddress: details.shipping.address,
          shippingMemo: details.shipping.memo,
          txHash: result.txHash,
        }),
      })

      if (!response.ok) {
        console.error('Failed to save order to database')
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Store recent purchase for optimistic UI update
      setRecentPurchase({ txHash: result.txHash, product: details.product })

      // Show success toast with View TX button
      toast.success(t('order.orderCompleted'), {
        description: t('order.orderConfirmed'),
        action: {
          label: t('common.viewTx'),
          onClick: () => window.open(`${EXPLORER_URL}${result.txHash}`, '_blank'),
        },
        duration: 10000,
      })
    } catch (err) {
      toast.dismiss(loadingToast)
      const errorMessage = err instanceof Error ? err.message : t('common.error')
      toast.error(t('common.error'), { description: errorMessage })
    }
  }, [address, publicClient, createOrder, t])

  if (loading) {
    return <StreamPageSkeleton />
  }

  if (error || !stream) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || t('stream.streamNotFound')}</p>
          <Button asChild>
            <Link href="/live">{t('common.goBack')}</Link>
          </Button>
        </div>
      </main>
    )
  }

  const displayTitle = stream.title_ko || stream.title
  const sellerName = stream.seller?.shop_name_ko || stream.seller?.shop_name || t('common.seller')
  const sellerWalletAddress = stream.seller?.wallet_address as Address | undefined
  const isLive = stream.status === 'live'
  const youtubeUrl = stream.youtube_url || ''

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/live">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('nav.live')}</span>
            </Link>
          </Button>
          <span className="font-semibold text-coral">{t('stream.labangLive')}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video */}
            <div className="relative">
              {youtubeUrl ? (
                <VideoPlayer
                  playbackId=""
                  title={displayTitle}
                  isLive={isLive}
                  streamType={isLive ? 'live' : 'on-demand'}
                  youtubeUrl={youtubeUrl}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">{t('stream.videoUnavailable')}</p>
                </div>
              )}
              {isLive && (
                <div className="absolute top-4 left-4">
                  <LiveBadge viewerCount={stream.viewer_count ?? 0} />
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div>
              <h1 className="text-xl font-bold mb-1">{displayTitle}</h1>
              <p className="text-muted-foreground">{sellerName}</p>
            </div>

            {/* Chat */}
            <div className="space-y-4">
              <StreamChat streamId={streamId} className="h-80" />
              <div className="flex gap-2">
                {sellerWalletAddress && (
                  <>
                    <GiftButton
                      streamId={streamId}
                      sellerId={sellerWalletAddress}
                      isConnected={isConnected}
                    />
                    <TipButton
                      streamId={streamId}
                      streamerId={sellerWalletAddress}
                      isConnected={isConnected}
                      onTipSuccess={handleTipSuccess}
                    />
                  </>
                )}
                <ChatInput
                  streamId={streamId}
                  userAddress={address}
                  isConnected={isConnected}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <WatchEarningsWrapper
              streamId={streamId}
              userAddress={address}
              isConnected={isConnected}
            />
            <RecentActivity streamerAddress={sellerWalletAddress} recentPurchase={recentPurchase} recentTip={recentTip} />
            <ProductSidebar
              products={stream.products || []}
              onProductClick={handleProductClick}
              onQuickBuy={handleQuickBuy}
            />
            {stream.seller && (
              <SellerCard seller={stream.seller} />
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Watch-to-Earn Tracker */}
          <div className="mb-4">
            <WatchEarningsWrapper
              streamId={streamId}
              userAddress={address}
              isConnected={isConnected}
            />
          </div>

          {/* Video */}
          <div className="relative -mx-4">
            {youtubeUrl ? (
              <VideoPlayer
                playbackId=""
                title={displayTitle}
                isLive={isLive}
                streamType={isLive ? 'live' : 'on-demand'}
                youtubeUrl={youtubeUrl}
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">{t('stream.videoUnavailable')}</p>
              </div>
            )}
            {isLive && (
              <div className="absolute top-4 left-4">
                <LiveBadge viewerCount={stream.viewer_count ?? 0} />
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="products" className="flex-1">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('stream.products')}
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('stream.chat')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <ProductSidebar
                products={stream.products || []}
                onProductClick={handleProductClick}
                onQuickBuy={handleQuickBuy}
              />
            </TabsContent>
            <TabsContent value="chat" className="mt-4 space-y-4">
              <StreamChat streamId={streamId} className="h-64" />
              <div className="flex gap-2">
                {sellerWalletAddress && (
                  <>
                    <GiftButton
                      streamId={streamId}
                      sellerId={sellerWalletAddress}
                      isConnected={isConnected}
                    />
                    <TipButton
                      streamId={streamId}
                      streamerId={sellerWalletAddress}
                      isConnected={isConnected}
                      onTipSuccess={handleTipSuccess}
                    />
                  </>
                )}
                <ChatInput
                  streamId={streamId}
                  userAddress={address}
                  isConnected={isConnected}
                  className="flex-1"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Quick View */}
      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onPurchase={(product) => handlePurchase(product)}
      />

      {/* Purchase Modal */}
      {purchaseProduct && (
        <PurchaseModal
          open={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          product={purchaseProduct}
          onConfirmPurchase={handleConfirmPurchase}
        />
      )}
    </main>
  )
}

function SellerCard({ seller }: { seller: { shop_name: string; shop_name_ko?: string | null; avatar?: string | null; kyc_verified?: boolean | null } }) {
  const { t } = useTranslation()
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-3">
        {seller.avatar ? (
          <img src={seller.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted" />
        )}
        <div>
          <p className="font-medium">{seller.shop_name_ko || seller.shop_name}</p>
          {seller.kyc_verified && (
            <span className="text-xs text-muted-foreground">{t('common.verified')}</span>
          )}
        </div>
      </div>
      <Button variant="outline" className="w-full mt-4">{t('common.follow')}</Button>
    </div>
  )
}

function StreamPageSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="aspect-video rounded-lg mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </main>
  )
}
