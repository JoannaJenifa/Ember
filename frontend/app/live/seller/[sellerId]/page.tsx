'use client';

import { use, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, Share2, MessageCircle, Gift, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { YouTubePlayer } from '../../components/youtube-player';
import { ProductOverlay } from '../../components/product-overlay';
import { TipForm } from '../../components/tip-form';
import { GiftSelector } from '../../components/gift-selector';
import { ActivityFeed } from '../../components/activity-feed';
import { SellerInfo } from '../../components/seller-info';
import { useSeller, useSellerProducts } from '@/hooks/use-seller';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { createOrder } from '@/lib/ember/order-transactions';
import type { TransactionContext } from '@/lib/ember/transactions';
import type { Product } from '@/lib/ember/product-queries';
import { usePrivy } from '@privy-io/react-auth';
import { usePrivyAvailable } from '@/app/providers';

interface SellerLivePageProps {
  params: Promise<{ sellerId: string }>;
}

export default function SellerLivePage({ params }: SellerLivePageProps) {
  const { sellerId } = use(params);
  const { seller, loading: sellerLoading, error: sellerError } = useSeller(sellerId);
  const { products, loading: productsLoading } = useSellerProducts(sellerId);
  const { walletAddress, isConnected, isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();

  const isPrivyAvailable = usePrivyAvailable();
  const privyHook = isPrivyAvailable ? usePrivy() : null;

  const [activeTab, setActiveTab] = useState<'interact' | 'products'>('interact');

  const handleBuyProduct = useCallback(async (product: Product, quantity: number) => {
    if (!walletAddress) {
      toast.error('Connect wallet to purchase');
      return;
    }

    const loadingToast = toast.loading('Processing purchase...');

    try {
      const context: TransactionContext = {
        isPrivy,
        signRawHash: isPrivy && privyHook ? privyHook.signMessage : undefined,
        publicKeyHex: isPrivy ? publicKeyHex : undefined,
        signAndSubmitTransaction: !isPrivy ? signAndSubmitTransaction ?? undefined : undefined,
      };

      const txHash = await createOrder(
        walletAddress,
        product.id,
        quantity,
        '', // shipping info - simplified for live purchase
        context
      );

      toast.dismiss(loadingToast);
      toast.success('Purchase successful!', {
        description: `${quantity}x ${product.title}`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://explorer.movementnetwork.xyz/txn/${txHash}`, '_blank'),
        },
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Purchase failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [walletAddress, isPrivy, publicKeyHex, signAndSubmitTransaction, privyHook]);

  if (sellerLoading) {
    return <PageSkeleton />;
  }

  if (sellerError || !seller) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Seller not found</p>
          <Button asChild>
            <Link href="/live">Back to Live</Link>
          </Button>
        </div>
      </main>
    );
  }

  const youtubeUrl = seller.youtubeChannel || '';
  const hasYoutube = !!youtubeUrl;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/live">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Live</span>
            </Link>
          </Button>
          <span className="font-semibold text-coral">{seller.shopName}</span>
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
          {/* Main Column - Video */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              {hasYoutube ? (
                <>
                  <YouTubePlayer videoUrl={youtubeUrl} title={seller.shopName} />
                  {!productsLoading && products.length > 0 && (
                    <ProductOverlay products={products} onBuy={handleBuyProduct} />
                  )}
                </>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No stream available</p>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div>
              <h1 className="text-xl font-bold mb-1">{seller.shopName} Live</h1>
              <p className="text-muted-foreground">{seller.description}</p>
            </div>

            {/* Activity Feed */}
            <ActivityFeed streamerAddress={sellerId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SellerInfo sellerAddress={sellerId} />
            <TipForm streamerAddress={sellerId} />
            <GiftSelector streamerAddress={sellerId} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Video */}
          <div className="relative -mx-4">
            {hasYoutube ? (
              <>
                <YouTubePlayer videoUrl={youtubeUrl} title={seller.shopName} />
                {!productsLoading && products.length > 0 && (
                  <ProductOverlay products={products} onBuy={handleBuyProduct} />
                )}
              </>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No stream available</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'interact' | 'products')} className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="interact" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Interact
              </TabsTrigger>
              <TabsTrigger value="products" className="flex-1">
                <Gift className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
            </TabsList>
            <TabsContent value="interact" className="mt-4 space-y-4">
              <ActivityFeed streamerAddress={sellerId} />
              <SellerInfo sellerAddress={sellerId} />
            </TabsContent>
            <TabsContent value="products" className="mt-4 space-y-4">
              <TipForm streamerAddress={sellerId} />
              <GiftSelector streamerAddress={sellerId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

function PageSkeleton() {
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
