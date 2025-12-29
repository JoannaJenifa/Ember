'use client'

import { useState } from 'react'
import { Radio } from 'lucide-react'
import { CategoryFilter } from '@/components/stream/category-filter'
import { SortDropdown, SortOptionValue } from '@/components/stream/sort-dropdown'
import { LiveNowSection } from '@/components/stream/live-now-section'
import { UpcomingSection } from '@/components/stream/upcoming-section'
import { ReplaySection } from '@/components/stream/replay-section'
import { useLiveStreams, useUpcomingStreams, useReplays } from '@/hooks/use-live-streams'
import { CategoryId } from '@/lib/types/product'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

export default function LivePage() {
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [sort, setSort] = useState<SortOptionValue>('viewers')
  const { t } = useTranslation()

  const { streams: liveStreams, isLoading: liveLoading } = useLiveStreams(
    category !== 'all' ? category : undefined
  )
  const { streams: upcomingStreams, isLoading: upcomingLoading } = useUpcomingStreams(24)
  const { streams: replays, isLoading: replaysLoading } = useReplays({
    category: category !== 'all' ? category : undefined,
    sort: sort === 'popular' ? 'popular' : 'latest',
    limit: 20,
  })

  const handleReminder = (streamId: string) => {
    // TODO: Implement reminder functionality
    toast.success(t('live.reminderSet'), {
      description: t('live.reminderDesc'),
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-live" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('live.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('live.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CategoryFilter selected={category} onSelect={setCategory} />
            <SortDropdown selected={sort} onSelect={setSort} />
          </div>
        </div>

        {/* Live Now Section */}
        <LiveNowSection streams={liveStreams} loading={liveLoading} className="mb-12" />

        {/* Upcoming Section */}
        <UpcomingSection
          streams={upcomingStreams}
          loading={upcomingLoading}
          onReminder={handleReminder}
          className="mb-12"
        />

        {/* Replay Section */}
        <ReplaySection streams={replays} loading={replaysLoading} />
      </div>
    </main>
  )
}
