'use client'

import { Card } from '@/components/ui/card'
import { StreamBadge } from './stream-badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Clock, Play, Radio, Users, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LabangStream } from '@/lib/db/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

export type StreamCardVariant = 'live' | 'scheduled' | 'replay'

interface StreamCardProps {
  stream: LabangStream
  variant?: StreamCardVariant
  sellerName?: string
  sellerAvatar?: string
  category?: string
  onReminder?: () => void
  className?: string
}

export function StreamCard({
  stream,
  variant = 'live',
  sellerName,
  sellerAvatar,
  category,
  onReminder,
  className,
}: StreamCardProps) {
  const { t, locale } = useTranslation()
  const displayTitle = locale === 'ko' ? (stream.title_ko || stream.title) : stream.title
  const dateLocale = locale === 'ko' ? ko : enUS

  return (
    <Link href={`/live/${stream.id}`}>
      <Card className={cn(
        'bg-card border-border overflow-hidden hover:border-coral/50 transition-colors cursor-pointer group',
        className
      )}>
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
          {stream.thumbnail ? (
            <img
              src={stream.thumbnail}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Radio className="h-12 w-12 text-muted-foreground" />
          )}

          {/* Variant-specific overlays */}
          {variant === 'live' && (
            <>
              <div className="absolute top-2 left-2">
                <StreamBadge />
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                <Users className="h-3 w-3" />
                {(stream.viewer_count ?? 0).toLocaleString()}
              </div>
            </>
          )}

          {variant === 'scheduled' && stream.scheduled_at && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
              <Clock className="h-3 w-3" />
              {format(new Date(stream.scheduled_at), locale === 'ko' ? 'a h시' : 'h:mm a', { locale: dateLocale })}
            </div>
          )}

          {variant === 'replay' && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-foreground ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                <Play className="h-3 w-3" />
                {(stream.peak_viewers ?? 0).toLocaleString()}
              </div>
              {stream.ended_at && (
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                  {formatDistanceToNow(new Date(stream.ended_at), { addSuffix: true, locale: dateLocale })}
                </div>
              )}
            </>
          )}

          {/* Category badge */}
          {category && variant === 'live' && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs">
              {category}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">{displayTitle}</h3>

          <div className="flex items-center gap-2">
            {sellerAvatar && (
              <img src={sellerAvatar} alt={sellerName} className="h-5 w-5 rounded-full object-cover" />
            )}
            {sellerName && (
              <p className="text-xs text-muted-foreground">{sellerName}</p>
            )}
          </div>

          {/* Reminder button for scheduled */}
          {variant === 'scheduled' && onReminder && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onReminder()
              }}
            >
              <Bell className="h-3 w-3 mr-1" />
              {t('live.reminderSet')}
            </Button>
          )}
        </div>
      </Card>
    </Link>
  )
}
