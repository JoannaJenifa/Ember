'use client'

import { LabangStream, LabangSeller } from '@/lib/db/supabase'
import { StreamCard } from './stream-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface StreamWithSeller extends LabangStream {
  seller?: LabangSeller | null
}

interface UpcomingSectionProps {
  streams: StreamWithSeller[]
  loading?: boolean
  onReminder?: (streamId: string) => void
  className?: string
}

function StreamCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden min-w-[200px]">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

export function UpcomingSection({
  streams,
  loading = false,
  onReminder,
  className,
}: UpcomingSectionProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <section className={cn('space-y-4', className)}>
        <h2 className="text-lg font-semibold text-foreground">{t('live.upcoming')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: 3 }).map((_, i) => (
            <StreamCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (streams.length === 0) {
    return (
      <section className={cn('space-y-4', className)}>
        <h2 className="text-lg font-semibold text-foreground">{t('live.upcoming')}</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium">{t('live.noUpcoming')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold text-foreground">{t('live.upcoming')}</h2>

      {/* Horizontal scroll for both mobile and desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {streams.map((stream) => (
          <div key={stream.id} className="min-w-[200px] md:min-w-[240px] flex-shrink-0">
            <StreamCard
              stream={stream}
              variant="scheduled"
              sellerName={stream.seller?.shop_name_ko || stream.seller?.shop_name}
              sellerAvatar={stream.seller?.profile_image ?? undefined}
              onReminder={onReminder ? () => onReminder(stream.id) : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
