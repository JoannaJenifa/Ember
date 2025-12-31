'use client'

import { useState } from 'react'
import { Coins } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from '@/lib/i18n'

interface EarningsModalProps {
  open: boolean
  onClose: () => void
  todayEarnings: number
  dailyLimit: number
  watchRewards: number
  commentRewards: number
  unclaimedAmount: number
  resetInSeconds: number
  onClaim: () => Promise<{ success: boolean; error?: string }>
}

export function EarningsModal({
  open,
  onClose,
  todayEarnings,
  dailyLimit,
  watchRewards,
  commentRewards,
  unclaimedAmount,
  resetInSeconds,
  onClaim,
}: EarningsModalProps) {
  const { t } = useTranslation()
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const hours = Math.floor(resetInSeconds / 3600)
  const minutes = Math.floor((resetInSeconds % 3600) / 60)

  const handleClaim = async () => {
    setClaiming(true)
    setClaimError(null)

    const result = await onClaim()
    setClaiming(false)

    if (!result.success) {
      setClaimError(result.error || t('earnings.claimFailed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            {t('earnings.todaysRewards')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Watch rewards */}
          <RewardProgress
            label={t('earnings.watchRewards')}
            detail={t('earnings.watchFiveMin', { count: Math.floor(watchRewards) })}
            value={watchRewards}
            max={10}
            amount={watchRewards}
          />

          {/* Comment rewards */}
          <RewardProgress
            label={t('earnings.commentRewards')}
            detail={t('earnings.qualityComments', { count: Math.floor(commentRewards * 2) })}
            value={commentRewards}
            max={10}
            amount={commentRewards}
          />

          {/* Daily limit */}
          <RewardProgress
            label={t('earnings.dailyLimit')}
            detail=""
            value={todayEarnings}
            max={dailyLimit}
            amount={todayEarnings}
            showMax
            maxLabel={`/${dailyLimit}`}
          />

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{t('earnings.totalEarned')}</span>
              <span className="text-lg font-bold">{todayEarnings} VERY</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('earnings.resetIn', { hours, minutes })}
            </p>
          </div>

          {/* Claim section */}
          {unclaimedAmount > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t('earnings.unclaimed', { amount: unclaimedAmount })}
              </p>
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full"
              >
                {claiming ? t('earnings.claiming') : t('earnings.claim')}
              </Button>
              {claimError && (
                <p className="text-sm text-destructive mt-2">{claimError}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RewardProgressProps {
  label: string
  detail: string
  value: number
  max: number
  amount: number
  showMax?: boolean
  maxLabel?: string
}

function RewardProgress({
  label,
  detail,
  value,
  max,
  amount,
  showMax,
  maxLabel,
}: RewardProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {Math.floor(value)}{showMax ? maxLabel : `/${max}`}
        </span>
      </div>
      <Progress value={percentage} className="h-2 mb-1" />
      {detail && (
        <p className="text-xs text-muted-foreground">
          {detail} = {amount} VERY
        </p>
      )}
    </div>
  )
}
