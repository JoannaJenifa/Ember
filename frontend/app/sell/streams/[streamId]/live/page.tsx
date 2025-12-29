'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, ExternalLink, Youtube } from 'lucide-react'
import { toast } from 'sonner'
import { useStream } from '@/lib/hooks/use-streams'
import { useSeller } from '@/lib/hooks/use-seller'
import { useAccount } from '@/lib/web3/providers'
import { LiveStats } from '@/components/stream/live-stats'
import { LiveProductManager } from '@/components/stream/live-product-manager'
import { LiveOrders } from '@/components/stream/live-orders'
import { LiveChat } from '@/components/stream/live-chat'
import { StreamBadge } from '@/components/stream/stream-badge'
import { YouTubePlayer } from '@/components/stream/youtube-player'
import { extractYouTubeVideoId } from '@/components/stream/youtube-player'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const streamId = params.streamId as string
  const { address } = useAccount()
  const { seller } = useSeller(address)
  const { stream, loading, refetch } = useStream(streamId)

  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [ending, setEnding] = useState(false)

  const isLive = stream?.status === 'live'
  const isScheduled = stream?.status === 'scheduled'
  const youtubeVideoId = stream?.youtube_url ? extractYouTubeVideoId(stream.youtube_url) : null

  // Fetch stream products
  useEffect(() => {
    if (streamId) {
      fetch(`/api/sell/streams/${streamId}/products`)
        .then((res) => res.json())
        .then((data) => setProducts(data.data || []))
        .catch(console.error)
    }
  }, [streamId])

  const handleAddProduct = async (productId: string) => {
    try {
      const addRes = await fetch(`/api/sell/streams/${streamId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, displayOrder: products.length }),
      })
      if (!addRes.ok) {
        const error = await addRes.json()
        throw new Error(error.error || 'Failed to add product')
      }
      const res = await fetch(`/api/sell/streams/${streamId}/products`)
      const data = await res.json()
      setProducts(data.data || [])
      toast.success(t('product.addedToStream'))
    } catch (error) {
      console.error('Failed to add product:', error)
      toast.error(t('product.failedToAdd'))
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/sell/streams/${streamId}/products?productId=${productId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove product')
      setProducts((prev) => prev.filter((p) => p.product_id !== productId))
      toast.success(t('product.removedFromStream'))
    } catch (error) {
      console.error('Failed to remove product:', error)
      toast.error(t('product.failedToRemove'))
    }
  }

  const handleReorder = async (newOrder: { productId: string; displayOrder: number }[]) => {
    await fetch(`/api/sell/streams/${streamId}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newOrder }),
    })
  }

  const handleEndStream = async () => {
    if (!confirm(t('stream.confirmDelete'))) return
    setEnding(true)
    try {
      await fetch(`/api/sell/streams/${streamId}/end`, { method: 'POST' })
      router.push('/sell/streams')
    } catch (error) {
      console.error('Failed to end stream:', error)
    } finally {
      setEnding(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[400px] lg:col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('stream.streamNotFound')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{t('dashboard.sellerDashboard')}</h1>
            {isLive && <StreamBadge />}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/live/${streamId}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Public
              </Button>
            </Link>
            {(isLive || isScheduled) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndStream}
                disabled={ending}
              >
                {ending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {t('stream.endStream')}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {stream.title_ko || stream.title}
        </p>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Preview + Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* YouTube Preview */}
            {youtubeVideoId ? (
              <YouTubePlayer
                videoId={youtubeVideoId}
                title={stream.title}
                isLive={isLive}
                autoplay
              />
            ) : (
              <Card className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No YouTube URL configured</p>
                </div>
              </Card>
            )}

            {/* YouTube URL Info */}
            {stream.youtube_url && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">YouTube URL:</span>
                  <a
                    href={stream.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:underline truncate"
                  >
                    {stream.youtube_url}
                  </a>
                </div>
              </Card>
            )}

            {/* Products + Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seller && (
                <LiveProductManager
                  streamId={streamId}
                  sellerId={seller.id}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onReorder={handleReorder}
                />
              )}
              <LiveOrders orders={orders} />
            </div>
          </div>

          {/* Right: Stats + Chat */}
          <div className="space-y-4">
            <LiveStats
              viewerCount={stream.viewer_count || 0}
              orderCount={orders.length}
              revenue={orders.reduce((sum, o) => sum + (o.totalVery || 0), 0)}
              giftCount={0}
            />
            <div className="h-[300px]">
              <LiveChat streamId={streamId} sellerAddress={address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
