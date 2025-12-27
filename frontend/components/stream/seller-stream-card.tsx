'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StreamBadge } from './stream-badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Clock,
  MoreVertical,
  Radio,
  Users,
  Pencil,
  Trash2,
  Play,
  BarChart3,
  ShoppingBag,
} from 'lucide-react'
import { LabangStream } from '@/lib/db/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

interface SellerStreamCardProps {
  stream: LabangStream
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function SellerStreamCard({
  stream,
  onEdit,
  onDelete,
  className,
}: SellerStreamCardProps) {
  const { t, locale } = useTranslation()
  const displayTitle = locale === 'ko' ? (stream.title_ko || stream.title) : stream.title
  const dateLocale = locale === 'ko' ? ko : enUS
  const isLive = stream.status === 'live'
  const isEnded = stream.status === 'ended'
  const isScheduled = stream.status === 'scheduled'

  const getDuration = () => {
    if (!stream.started_at || !stream.ended_at) return null
    const start = new Date(stream.started_at).getTime()
    const end = new Date(stream.ended_at).getTime()
    const minutes = Math.floor((end - start) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <Card
      className={cn(
        'bg-card border-border overflow-hidden hover:border-coral/50 transition-colors',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {stream.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <Radio className="h-12 w-12 text-muted-foreground" />
        )}

        {isLive && (
          <div className="absolute top-2 left-2">
            <StreamBadge />
          </div>
        )}

        {isScheduled && stream.scheduled_at && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
            <Clock className="h-3 w-3" />
            {format(new Date(stream.scheduled_at), locale === 'ko' ? 'M/d a h시' : 'M/d h:mm a', { locale: dateLocale })}
          </div>
        )}

        {isEnded && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-muted text-foreground text-xs">
            {t('stream.ended')}
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
          <Users className="h-3 w-3" />
          {isEnded ? stream.peak_viewers ?? 0 : stream.viewer_count ?? 0}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 flex-1">
            {displayTitle}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isEnded && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
              )}
              {isEnded && (
                <DropdownMenuItem asChild>
                  <Link href={`/sell/streams/${stream.id}/analytics`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('analytics.title')}
                  </Link>
                </DropdownMenuItem>
              )}
              {!isLive && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {isEnded && getDuration() && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getDuration()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />0 {t('order.myOrders')}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {isLive && (
            <Link href={`/sell/streams/${stream.id}/live`} className="flex-1">
              <Button size="sm" className="w-full gap-2 bg-coral hover:bg-coral/90">
                <Radio className="h-4 w-4" />
                {t('seller.dashboard')}
              </Button>
            </Link>
          )}
          {isScheduled && (
            <Link href={`/sell/streams/${stream.id}/live`} className="flex-1">
              <Button size="sm" className="w-full gap-2">
                <Play className="h-4 w-4" />
                {t('stream.startStream')}
              </Button>
            </Link>
          )}
          {isEnded && stream.recording_url && (
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Play className="h-4 w-4" />
              {t('live.replay')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
