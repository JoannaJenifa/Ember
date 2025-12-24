'use client';

import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  MessageCircle,
  Package,
  Gift,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/stream/video-player';
import { LiveBadge } from '@/components/stream/live-badge';
import { StreamChat } from '@/components/stream/stream-chat';
import { ChatInput } from '@/components/stream/chat-input';
import { BuyDialog } from '@/components/buy-dialog';
import { TipForm } from '@/app/live/components/tip-form';
import { GiftSelector } from '@/app/live/components/gift-selector';
import { useStream } from '@/lib/hooks/use-stream';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { formatUsdcAmount } from '@/lib/aptos';
import { Product } from '@/lib/ember/product-queries';

interface StreamPageProps {
  params: Promise<{ streamId: string }>;
}

export default function StreamPage({ params }: StreamPageProps) {
  const { streamId } = use(params);
  const { stream, loading, error } = useStream(streamId);
  const { walletAddress: address, isConnected } = useWalletContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setBuyDialogOpen(true);
  };

  if (loading) {
    return <StreamPageSkeleton />;
  }

  if (error || !stream) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Stream not found'}</p>
          <Button asChild>
            <Link href="/live">Go Back</Link>
          </Button>
        </div>
      </main>
    );
  }

  const sellerName = stream.seller?.shopName || 'Seller';
  const sellerAddress = stream.seller_address;
  const isLive = stream.is_live;
  const youtubeUrl = stream.youtube_url;
  const products = stream.products || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/live">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <span className="font-semibold text-ember">Ember Live</span>
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
                  title={stream.title}
                  isLive={isLive}
                  streamType={isLive ? 'live' : 'on-demand'}
                  youtubeUrl={youtubeUrl}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Video unavailable</p>
                </div>
              )}
              {isLive && (
                <div className="absolute top-4 left-4">
                  <LiveBadge viewerCount={stream.viewer_count} />
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div>
              <h1 className="text-xl font-bold mb-1">{stream.title}</h1>
              <p className="text-muted-foreground">{sellerName}</p>
            </div>

            {/* Chat */}
            <div className="space-y-4">
              <StreamChat streamId={streamId} className="h-80" />
              <ChatInput
                streamId={streamId}
                userAddress={address}
                sellerAddress={sellerAddress}
                isConnected={isConnected}
                className="flex-1"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Products */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-5 w-5 text-ember" />
                <h2 className="font-semibold">Featured Products</h2>
                <Badge variant="secondary" className="ml-auto">
                  {products.length}
                </Badge>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products featured</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {products.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      onBuy={() => handleBuyClick(product)}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Tip & Gift */}
            <TipForm streamerAddress={sellerAddress} />
            <GiftSelector streamerAddress={sellerAddress} />

            {/* Seller Card */}
            {stream.seller && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  {stream.seller.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stream.seller.profileImage}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted" />
                  )}
                  <div>
                    <p className="font-medium">{stream.seller.shopName}</p>
                    <p className="text-xs text-muted-foreground">
                      {stream.seller.totalOrders} orders
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Video */}
          <div className="relative -mx-4">
            {youtubeUrl ? (
              <VideoPlayer
                playbackId=""
                title={stream.title}
                isLive={isLive}
                streamType={isLive ? 'live' : 'on-demand'}
                youtubeUrl={youtubeUrl}
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video unavailable</p>
              </div>
            )}
            {isLive && (
              <div className="absolute top-4 left-4">
                <LiveBadge viewerCount={stream.viewer_count} />
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="mt-4">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="products">
                <ShoppingBag className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="tip">
                <DollarSign className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="gift">
                <Gift className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    onBuy={() => handleBuyClick(product)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="chat" className="mt-4 space-y-4">
              <StreamChat streamId={streamId} className="h-64" />
              <ChatInput
                streamId={streamId}
                userAddress={address}
                sellerAddress={sellerAddress}
                isConnected={isConnected}
                className="flex-1"
              />
            </TabsContent>
            <TabsContent value="tip" className="mt-4">
              <TipForm streamerAddress={sellerAddress} />
            </TabsContent>
            <TabsContent value="gift" className="mt-4">
              <GiftSelector streamerAddress={sellerAddress} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Buy Dialog */}
      <BuyDialog
        product={selectedProduct}
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
      />
    </main>
  );
}

function ProductItem({
  product,
  onBuy,
}: {
  product: Product;
  onBuy: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{product.title}</p>
        <p className="text-sm font-bold text-ember">
          ${formatUsdcAmount(product.price)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={onBuy}
        disabled={product.inventory === 0}
      >
        Buy
      </Button>
    </div>
  );
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
  );
}
