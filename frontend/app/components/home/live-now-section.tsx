'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function LiveNowSection() {
  const { t } = useTranslation();
  // TODO: Fetch real live streams from on-chain/API data
  const liveStreams: Array<{
    id: string;
    sellerName: string;
    thumbnail: string;
    viewers: number;
    category: string;
  }> = [];

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

      <Card className="bg-card border-border p-8 text-center">
        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.noLiveStreams')}</h3>
        <p className="text-muted-foreground mb-4">{t('home.noLiveStreamsDesc')}</p>
        <Link href="/live">
          <Button variant="outline">{t('home.browseStreams')}</Button>
        </Link>
      </Card>
    </section>
  );
}
