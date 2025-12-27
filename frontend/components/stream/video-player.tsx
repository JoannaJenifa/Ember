'use client'

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { YouTubePlayer, extractYouTubeVideoId } from './youtube-player'

interface VideoPlayerProps {
  playbackId?: string // Kept for backward compatibility, not used
  title: string
  isLive?: boolean
  streamType?: 'live' | 'on-demand'
  className?: string
  youtubeUrl?: string
}

export function VideoPlayer({
  title,
  isLive = false,
  className,
  youtubeUrl,
}: VideoPlayerProps) {
  const { t } = useTranslation()

  // Extract video ID from YouTube URL
  if (youtubeUrl) {
    const videoId = extractYouTubeVideoId(youtubeUrl)
    if (videoId) {
      return (
        <YouTubePlayer
          videoId={videoId}
          title={title}
          isLive={isLive}
          autoplay={isLive}
          className={className}
        />
      )
    }
  }

  // No valid YouTube URL provided
  return (
    <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
      <div className="text-center text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
        <p className="font-medium">{t('stream.videoUnavailable')}</p>
        <p className="text-sm">No YouTube URL configured</p>
      </div>
    </div>
  )
}
