'use client'

import { cn } from '@/lib/utils'

interface StreamBadgeProps {
  className?: string
}

export function StreamBadge({ className }: StreamBadgeProps) {
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-live text-live-foreground text-xs font-medium', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
      LIVE
    </div>
  )
}
