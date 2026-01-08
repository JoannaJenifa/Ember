'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Users, ArrowRight, Store } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Placeholder for live streams (would come from real-time data)
const MOCK_LIVE_STREAMS = [
  {
    id: '1',
    sellerName: 'Fashion Hub',
    thumbnail: '/placeholder-stream.jpg',
    viewers: 234,
    category: 'Fashion',
  },
  {
    id: '2',
    sellerName: 'Tech World',
    thumbnail: '/placeholder-stream.jpg',
    viewers: 156,
    category: 'Electronics',
  },
  {
    id: '3',
    sellerName: 'Beauty Corner',
    thumbnail: '/placeholder-stream.jpg',
    viewers: 89,
    category: 'Beauty',
  },
];

export function LiveNowSection() {
  const { t } = useTranslation();
  // In production, this would fetch from the indexer or API
  const liveStreams = MOCK_LIVE_STREAMS;
  const hasLiveStreams = liveStreams.length > 0;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-6 w-6 text-live" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-live rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('home.liveNow')}</h2>
        </div>
        <Link href="/live">
          <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
            {t('common.seeAll')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {hasLiveStreams ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveStreams.map((stream) => (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer bg-card border-border">
                <div className="aspect-video relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Badge className="absolute top-2 left-2 bg-live text-white gap-1">
                    <Radio className="h-3 w-3" />
                    LIVE
                  </Badge>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    <Users className="h-3 w-3" />
                    {stream.viewers}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{stream.sellerName}</h3>
                  <p className="text-sm text-muted-foreground">{stream.category}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-8 text-center">
          <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.noLiveStreams')}</h3>
          <p className="text-muted-foreground mb-4">{t('home.noLiveStreamsDesc')}</p>
          <Link href="/live">
            <Button variant="outline">{t('home.browseStreams')}</Button>
          </Link>
        </Card>
      )}
    </section>
  );
}
