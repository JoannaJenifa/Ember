'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, ArrowRight, Users, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLiveStreams } from '@/hooks/use-live-streams';

export function LiveNowSection() {
  const { t } = useTranslation();
  const { streams, isLoading } = useLiveStreams();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-6 w-6 text-live" />
            {streams.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-live rounded-full animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('home.liveNow')}</h2>
          {streams.length > 0 && (
            <span className="text-sm text-muted-foreground">({streams.length})</span>
          )}
        </div>
        <Link href="/live">
          <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
            {t('common.seeAll')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-8 w-8 text-ember mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading streams...</p>
        </Card>
      ) : streams.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.noLiveStreams')}</h3>
          <p className="text-muted-foreground mb-4">{t('home.noLiveStreamsDesc')}</p>
          <Link href="/live">
            <Button variant="outline">{t('home.browseStreams')}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {streams.slice(0, 4).map((stream) => (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <Card className="bg-card border-border overflow-hidden hover:border-ember/50 transition-colors cursor-pointer group">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {stream.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Radio className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-red-500 text-white text-xs font-medium flex items-center gap-1">
                    <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/60 text-white text-xs">
                    <Users className="h-3 w-3" />
                    {stream.viewer_count}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground text-sm line-clamp-1">{stream.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {stream.seller?.profile_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stream.seller.profile_image}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {stream.seller?.shop_name || 'Seller'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
