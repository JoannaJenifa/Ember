'use client'

import { LabangStream } from '@/lib/db/supabase'
import { StreamCard, StreamCardVariant } from './stream-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface StreamWithSeller extends LabangStream {
  seller?: {
    shop_name: string
    shop_name_ko?: string | null
    profile_image?: string | null
  } | null
  category?: string
}

interface StreamGridProps {
  streams: StreamWithSeller[]
  variant?: StreamCardVariant
  loading?: boolean
  emptyMessage?: string
  emptySubMessage?: string
  onReminder?: (streamId: string) => void
  className?: string
}

function StreamCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function StreamGrid({
  streams,
  variant = 'live',
  loading = false,
  emptyMessage,
  emptySubMessage,
  onReminder,
  className,
}: StreamGridProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StreamCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Radio className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-foreground font-medium">{emptyMessage || t('live.noLiveStreams')}</p>
        {emptySubMessage && (
          <p className="text-muted-foreground text-sm mt-1">{emptySubMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {streams.map((stream) => (
        <StreamCard
          key={stream.id}
          stream={stream}
          variant={variant}
          sellerName={stream.seller?.shop_name_ko || stream.seller?.shop_name}
          sellerAvatar={stream.seller?.profile_image ?? undefined}
          category={stream.category}
          onReminder={onReminder ? () => onReminder(stream.id) : undefined}
        />
      ))}
    </div>
  )
}
