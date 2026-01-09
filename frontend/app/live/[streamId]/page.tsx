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
// TODO: These components use EVM/wagmi hooks - need to migrate to Move
// import { GiftButton } from '@/components/stream/gift-button'
// import { TipButton, type TipData } from '@/components/tips/tip-button'
// import { WatchEarningsWrapper } from '@/components/earn'
// import { RecentActivity } from '@/components/stream/recent-activity'
import { PurchaseModal, type PurchaseDetails } from '@/components/order/purchase-modal'
import { useStream } from '@/lib/hooks/use-stream'
import { useWalletContext } from '@/hooks/use-wallet-context'
import { useTranslation } from '@/lib/i18n'
import { createOrder } from '@/lib/ember/order-transactions'
import type { ProductWithSeller } from '@/lib/types/product'

const EXPLORER_URL = 'https://explorer.movementnetwork.xyz/txn/'

interface StreamPageProps {
  params: Promise<{ streamId: string }>
}

export default function StreamPage({ params }: StreamPageProps) {
  const { streamId } = use(params)
  const { stream, loading, error } = useStream(streamId)
  const { walletAddress: address, isConnected, isPrivy, signRawHash, publicKeyHex, signAndSubmitTransaction } = useWalletContext()
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [purchaseProduct, setPurchaseProduct] = useState<ProductWithSeller | null>(null)
  const [recentPurchase, setRecentPurchase] = useState<{ txHash: string; product: ProductWithSeller } | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)

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


  const handleConfirmPurchase = useCallback(async (details: PurchaseDetails) => {
    if (!address || !details.product.seller) {
      toast.error(t('common.error'), { description: t('wallet.connectFirst') })
      return
    }

    setOrderLoading(true)
    const loadingToast = toast.loading(t('order.processing'))

    try {
      const productId = parseInt(details.product.id)
      const shippingJson = JSON.stringify({
        name: details.shipping.name,
        phone: details.shipping.phone,
        address: details.shipping.address,
        memo: details.shipping.memo || '',
      })

      const txHash = await createOrder(
        address,
        productId,
        details.quantity,
        shippingJson,
        {
          isPrivy,
          signRawHash: signRawHash || undefined,
          publicKeyHex: publicKeyHex || undefined,
          signAndSubmitTransaction: signAndSubmitTransaction || undefined,
        }
      )

      toast.dismiss(loadingToast)
      toast.success(t('order.success'), {
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      })
      setRecentPurchase({ txHash, product: details.product })
    } catch (err) {
      console.error('Order creation failed:', err)
      toast.dismiss(loadingToast)
      toast.error(t('common.error'), {
        description: err instanceof Error ? err.message : t('order.failed'),
      })
    } finally {
      setOrderLoading(false)
    }
  }, [address, t, isPrivy, signRawHash, publicKeyHex, signAndSubmitTransaction])

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
  const sellerWalletAddress = stream.seller?.wallet_address as string | undefined
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
          <span className="font-semibold text-ember">{t('stream.labangLive')}</span>
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
                {/* TODO: Gift and Tip buttons need Move migration */}
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
            {/* TODO: WatchEarningsWrapper and RecentActivity need Move migration */}
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
          {/* TODO: Watch-to-Earn Tracker needs Move migration */}

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
                {/* TODO: Gift and Tip buttons need Move migration */}
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
