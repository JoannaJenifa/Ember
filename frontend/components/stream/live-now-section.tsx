'use client'

import { LabangStream, LabangSeller } from '@/lib/db/supabase'
import { StreamCard } from './stream-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Radio, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface StreamWithSeller extends LabangStream {
  seller?: LabangSeller | null
  category?: string
}

interface LiveNowSectionProps {
  streams: StreamWithSeller[]
  loading?: boolean
  className?: string
}

function StreamCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden min-w-[240px]">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function LiveNowSection({ streams, loading = false, className }: LiveNowSectionProps) {
  const { t } = useTranslation()
  const showSeeMore = streams.length > 8
  const displayStreams = streams.slice(0, 8)

  if (loading) {
    return (
      <section className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('live.liveNow')}</h2>
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:hidden scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <StreamCardSkeleton key={i} />
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StreamCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (streams.length === 0) {
    return (
      <section className={cn('space-y-4', className)}>
        <h2 className="text-lg font-semibold text-foreground">{t('live.liveNow')}</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
          <Radio className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium">{t('live.noLiveStreams')}</p>
          <p className="text-muted-foreground text-sm mt-1">{t('live.checkUpcoming')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t('live.liveNow')}</h2>
        {showSeeMore && (
          <Link
            href="/live?status=live"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {t('common.seeMore')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 md:hidden scrollbar-hide">
        {displayStreams.map((stream) => (
          <div key={stream.id} className="min-w-[240px] flex-shrink-0">
            <StreamCard
              stream={stream}
              variant="live"
              sellerName={stream.seller?.shop_name_ko || stream.seller?.shop_name}
              sellerAvatar={stream.seller?.profile_image ?? undefined}
              category={stream.category}
            />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {displayStreams.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            variant="live"
            sellerName={stream.seller?.shop_name_ko || stream.seller?.shop_name}
            sellerAvatar={stream.seller?.profile_image ?? undefined}
            category={stream.category}
          />
        ))}
      </div>
    </section>
  )
}
