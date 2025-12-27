'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface YouTubePlayerProps {
  videoId: string
  title?: string
  isLive?: boolean
  autoplay?: boolean
  className?: string
}

export function YouTubePlayer({
  videoId,
  title = 'YouTube Video',
  isLive = false,
  autoplay = false,
  className,
}: YouTubePlayerProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">{t('stream.videoUnavailable')}</p>
          <p className="text-sm">{t('errors.tryAgain')}</p>
        </div>
      </div>
    )
  }

  // Build YouTube embed URL with parameters
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`)
  embedUrl.searchParams.set('rel', '0') // Don't show related videos
  embedUrl.searchParams.set('modestbranding', '1') // Minimal YouTube branding
  if (autoplay) {
    embedUrl.searchParams.set('autoplay', '1')
    embedUrl.searchParams.set('mute', '1') // Must mute for autoplay to work
  }

  return (
    <div className={cn('relative aspect-video rounded-lg overflow-hidden bg-black', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Radio className="h-12 w-12 text-muted-foreground animate-pulse" />
          </div>
        </div>
      )}
      <iframe
        src={embedUrl.toString()}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}

// Helper to extract video ID from various YouTube URL formats
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
