'use client';

import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Gift, Heart, Loader2 } from 'lucide-react';
import { useSeller } from '@/hooks/use-seller';
import { useStreamerTips } from '@/hooks/use-tips';
import { useStreamerGifts } from '@/hooks/use-gifts';
import { formatUsdcAmount } from '@/lib/aptos';

interface EarningsDashboardProps {
  sellerAddress: string;
}

export function EarningsDashboard({ sellerAddress }: EarningsDashboardProps) {
  const { seller, loading: sellerLoading } = useSeller(sellerAddress);
  const { tips, total: tipsTotal, loading: tipsLoading } = useStreamerTips(sellerAddress, 5);
  const { gifts, earnings: giftsTotal, loading: giftsLoading } = useStreamerGifts(sellerAddress, 5);

  const loading = sellerLoading || tipsLoading || giftsLoading;
  const totalEarnings = (seller?.totalSales || 0) + tipsTotal + giftsTotal;

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-lg font-bold text-foreground">
                ${formatUsdcAmount(totalEarnings)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-ember/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-ember" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sales Revenue</p>
              <p className="text-lg font-bold text-foreground">
                ${formatUsdcAmount(seller?.totalSales || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tips Received</p>
              <p className="text-lg font-bold text-foreground">
                ${formatUsdcAmount(tipsTotal)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Gift className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gifts Received</p>
              <p className="text-lg font-bold text-foreground">
                ${formatUsdcAmount(giftsTotal)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Recent Tips</h3>
          {tips.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No tips yet</p>
          ) : (
            <div className="space-y-3">
              {tips.map((tip) => (
                <div key={tip.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {formatAddress(tip.sender)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(tip.timestamp)}</p>
                  </div>
                  <span className="text-ember font-semibold">
                    +${formatUsdcAmount(tip.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Recent Gifts</h3>
          {gifts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No gifts yet</p>
          ) : (
            <div className="space-y-3">
              {gifts.map((gift) => (
                <div key={gift.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {formatAddress(gift.sender)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {gift.quantity}x Gift · {formatTime(gift.timestamp)}
                    </p>
                  </div>
                  <span className="text-purple-500 font-semibold">
                    +${formatUsdcAmount(gift.totalValue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Seller Stats */}
      {seller && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Shop Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold text-foreground">{seller.totalOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Average Rating</p>
              <p className="text-lg font-bold text-foreground">
                {seller.ratingCount > 0
                  ? (seller.ratingSum / seller.ratingCount).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Reviews</p>
              <p className="text-lg font-bold text-foreground">{seller.ratingCount}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
