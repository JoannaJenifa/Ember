'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, Package, ShoppingCart, Video, DollarSign } from 'lucide-react';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { useSeller, useIsVerifiedSeller } from '@/hooks/use-seller';
import { SellerRegistration } from './components/seller-registration';
import { SellerProfileHeader } from './components/seller-profile-header';
import { ProductList } from './components/product-list';
import { OrderManagement } from './components/order-management';
import { GoLivePanel } from './components/go-live-panel';
import { EarningsDashboard } from './components/earnings-dashboard';

export default function SellPage() {
  const { walletAddress, isConnected, login } = useWalletContext();
  const { isVerified, isRegistered, loading } = useIsVerifiedSeller(walletAddress);
  const { seller, refetch: refetchSeller } = useSeller(walletAddress);
  const [activeTab, setActiveTab] = useState('products');

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center bg-card border-border">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to access the seller dashboard
            </p>
            <button
              onClick={login}
              className="bg-ember hover:bg-ember/90 text-white px-6 py-2 rounded-lg font-medium"
            >
              Connect Wallet
            </button>
          </Card>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-ember" />
        </div>
      </main>
    );
  }

  if (!isRegistered) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <SellerRegistration walletAddress={walletAddress!} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {seller && (
          <SellerProfileHeader
            seller={seller}
            onProfileUpdate={refetchSeller}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Go Live</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Earnings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductList sellerAddress={walletAddress!} />
          </TabsContent>
          <TabsContent value="orders">
            <OrderManagement sellerAddress={walletAddress!} />
          </TabsContent>
          <TabsContent value="live">
            <GoLivePanel sellerAddress={walletAddress!} />
          </TabsContent>
          <TabsContent value="earnings">
            <EarningsDashboard sellerAddress={walletAddress!} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
