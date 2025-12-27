'use client'

import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

interface LiveBadgeProps {
  viewerCount?: number
  className?: string
}

export function LiveBadge({ viewerCount, className }: LiveBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* LIVE indicator */}
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-live text-live-foreground text-xs font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
        LIVE
      </div>

      {/* Viewer count */}
      {viewerCount !== undefined && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
          <Users className="h-3 w-3" />
          {viewerCount.toLocaleString()}
        </div>
      )}
    </div>
  )
}
