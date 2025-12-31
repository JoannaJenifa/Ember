'use client'

import { Coins, Clock, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

const REWARD_INTERVAL = 300 // 5 minutes in seconds

interface EarningsTrackerProps {
  watchTime: number // seconds
  todayEarnings: number
  dailyLimit: number
  isEarning: boolean
  isPaused: boolean
  onClick?: () => void
  className?: string
}

export function EarningsTracker({
  watchTime,
  todayEarnings,
  dailyLimit,
  isEarning,
  isPaused,
  onClick,
  className,
}: EarningsTrackerProps) {
  const { t } = useTranslation()
  const minutes = Math.floor(watchTime / 60)
  const secondsToNextReward = REWARD_INTERVAL - (watchTime % REWARD_INTERVAL)
  const minutesToNextReward = Math.floor(secondsToNextReward / 60)
  const progressToNextReward = ((REWARD_INTERVAL - secondsToNextReward) / REWARD_INTERVAL) * 100
  const dailyProgress = (todayEarnings / dailyLimit) * 100

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full bg-card border rounded-lg p-3 text-left transition-all',
        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {t('earnings.todayEarned', { amount: String(todayEarnings) })}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Clock className="h-3 w-3" />
        <span>{t('earnings.watchTime', { minutes: String(minutes) })}</span>
        {isEarning && !isPaused && (
          <span className="ml-auto text-primary">
            {t('earnings.nextReward', { minutes: String(minutesToNextReward) })}
          </span>
        )}
        {isPaused && (
          <span className="ml-auto text-yellow-500">{t('earnings.paused')}</span>
        )}
      </div>

      {isEarning && !isPaused && (
        <Progress value={progressToNextReward} className="h-1.5" />
      )}

      {dailyProgress >= 100 && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('earnings.dailyLimitReached')}
        </p>
      )}
    </button>
  )
}
