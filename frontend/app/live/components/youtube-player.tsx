'use client';

import { useState } from 'react';
import { AlertCircle, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export function YouTubePlayer({
  videoUrl,
  title = 'Live Stream',
  autoplay = true,
  className,
}: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/live\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Invalid YouTube URL</p>
          <p className="text-sm">Please provide a valid YouTube video or live stream URL</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn('aspect-video bg-muted rounded-lg flex items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="font-medium">Video unavailable</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('modestbranding', '1');
  if (autoplay) {
    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('mute', '1');
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
