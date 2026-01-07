'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Heart, Gift, ShoppingBag, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreamerTips } from '@/hooks/use-tips';
import { useStreamerGifts, GIFT_EMOJIS, GIFT_NAMES } from '@/hooks/use-gifts';

const EXPLORER_URL = 'https://explorer.movementnetwork.xyz/txn/';

interface ActivityItem {
  id: string;
  type: 'tip' | 'gift' | 'purchase';
  sender: string;
  amount?: number;
  message?: string;
  giftType?: number;
  quantity?: number;
  timestamp: number;
}

interface ActivityFeedProps {
  streamerAddress: string;
  pollInterval?: number;
  className?: string;
}

export function ActivityFeed({
  streamerAddress,
  pollInterval = 5000,
  className,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const { tips, loading: tipsLoading, refetch: refetchTips } = useStreamerTips(
    streamerAddress,
    10,
    pollInterval
  );
  const { gifts, loading: giftsLoading, refetch: refetchGifts } = useStreamerGifts(
    streamerAddress,
    10,
    pollInterval
  );

  const loading = tipsLoading || giftsLoading;

  // Combine and sort activities
  useEffect(() => {
    const combined: ActivityItem[] = [
      ...tips.map((tip) => ({
        id: `tip-${tip.id}`,
        type: 'tip' as const,
        sender: tip.sender,
        amount: tip.amount,
        message: tip.message,
        timestamp: tip.timestamp,
      })),
      ...gifts.map((gift) => ({
        id: `gift-${gift.id}`,
        type: 'gift' as const,
        sender: gift.sender,
        giftType: gift.giftType,
        quantity: gift.quantity,
        amount: gift.totalValue,
        message: gift.message,
        timestamp: gift.timestamp,
      })),
    ];

    combined.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(combined.slice(0, 15));
  }, [tips, gifts]);

  const handleRefresh = () => {
    refetchTips();
    refetchGifts();
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatAmount = (amount: number) => (amount / 1e8).toFixed(2);
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-6" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-ember" />
          <h3 className="font-semibold">Live Activity</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity yet</p>
          <p className="text-xs">Tips and gifts will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const isTip = activity.type === 'tip';
  const isGift = activity.type === 'gift';
  const isPurchase = activity.type === 'purchase';

  const Icon = isPurchase ? ShoppingBag : isTip ? Heart : Gift;
  const iconColor = isPurchase ? 'text-green-500' : isTip ? 'text-pink-500' : 'text-amber-500';

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatAmount = (amount: number) => (amount / 1e8).toFixed(2);
  const formatTime = (timestamp: number) => {
    const diff = (Date.now() / 1000 - timestamp);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm">
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-mono text-xs">{formatAddress(activity.sender)}</span>
          <span className="text-muted-foreground">sent</span>
          {isTip && (
            <Badge variant="outline" className="text-xs">
              {formatAmount(activity.amount || 0)} MOVE
            </Badge>
          )}
          {isGift && activity.giftType !== undefined && (
            <Badge variant="outline" className="text-xs">
              {activity.quantity}x {GIFT_EMOJIS[activity.giftType]} {GIFT_NAMES[activity.giftType]}
            </Badge>
          )}
        </div>
        {activity.message && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            "{activity.message}"
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
}
