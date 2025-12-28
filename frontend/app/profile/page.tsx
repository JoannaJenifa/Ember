'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  ShoppingBag,
  Star,
  Gift,
  Heart,
  ExternalLink,
  Copy,
  Loader2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { useBuyerOrders } from '@/hooks/use-orders';
import { useIsVerifiedSeller } from '@/hooks/use-seller';
import { formatUsdcAmount, getAccountExplorerUrl } from '@/lib/aptos';
import { OrderStatus } from '@/lib/ember/order-queries';

export default function ProfilePage() {
  const { walletAddress, isConnected, login, logout } = useWalletContext();
  const { orders, loading: ordersLoading } = useBuyerOrders(walletAddress);
  const { isVerified, isRegistered, loading: sellerLoading } = useIsVerifiedSeller(walletAddress);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Calculate order stats
  const orderStats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === OrderStatus.Delivered).length,
    pending: orders.filter((o) => o.status === OrderStatus.Paid || o.status === OrderStatus.Shipped)
      .length,
    totalSpent: orders.reduce((sum, o) => sum + o.totalPrice, 0),
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center bg-card border-border">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">My Profile</h1>
            <p className="text-muted-foreground mb-6">Connect your wallet to view your profile</p>
            <Button onClick={login} className="bg-ember hover:bg-ember/90">
              Connect Wallet
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const loading = ordersLoading || sellerLoading;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

        {/* Wallet Info */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full bg-ember/20 flex items-center justify-center">
              <Wallet className="h-7 w-7 text-ember" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-foreground truncate">{formatAddress(walletAddress!)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getAccountExplorerUrl(walletAddress!)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {isRegistered && (
            <Badge className={isVerified ? 'bg-green-500' : 'bg-yellow-500'}>
              {isVerified ? 'Verified Seller' : 'Seller (Pending Verification)'}
            </Badge>
          )}

          <Separator className="my-4" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="text-red-500 hover:text-red-600"
          >
            Disconnect Wallet
          </Button>
        </Card>

        {/* Quick Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-ember" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-lg font-bold text-foreground">{orderStats.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Star className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-lg font-bold text-foreground">{orderStats.completed}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-lg font-bold text-foreground">{orderStats.pending}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-ember/20 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-ember" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-bold text-foreground">
                      ${formatUsdcAmount(orderStats.totalSpent)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Links */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/orders">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View My Orders
                  </Link>
                </Button>
                {isRegistered ? (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/sell">
                      <Star className="h-4 w-4 mr-2" />
                      Seller Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/sell">
                      <Star className="h-4 w-4 mr-2" />
                      Become a Seller
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/products">
                    <Gift className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/live">
                    <Heart className="h-4 w-4 mr-2" />
                    Watch Live Streams
                  </Link>
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
