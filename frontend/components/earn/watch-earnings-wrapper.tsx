'use client'

import { useState, useCallback } from 'react'
import { useWatchEarnings, type Reward } from '@/lib/hooks/use-watch-earnings'
import { useDailyEarnings } from '@/lib/hooks/use-daily-earnings'
import { EarningsTracker } from './earnings-tracker'
import { EarningsModal } from './earnings-modal'
import { RewardToast, useRewardToasts } from './reward-toast'
import { AttentionCheck } from './attention-check'
import { useTranslation } from '@/lib/i18n'

interface WatchEarningsWrapperProps {
  streamId: string
  userAddress: string | undefined
  isConnected: boolean
}

export function WatchEarningsWrapper({
  streamId,
  userAddress,
  isConnected,
}: WatchEarningsWrapperProps) {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const { currentToast, hideCurrentToast, showReward } = useRewardToasts()

  const handleReward = useCallback((reward: Reward) => {
    const reason = reward.type === 'watch_5min' ? t('earnings.watchFiveMin', { count: 1 }) : t('earnings.watchFiveMin', { count: 6 })
    showReward(reward.amount, reason)
  }, [showReward, t])

  const {
    watchTime,
    isEarning,
    isPaused,
    attentionCheckVisible,
    handleAttentionCheck,
  } = useWatchEarnings({
    streamId,
    userAddress,
    isConnected,
    onReward: handleReward,
  })

  const {
    todayEarnings,
    dailyLimit,
    unclaimedAmount,
    resetInSeconds,
    claimRewards,
    data,
  } = useDailyEarnings({
    userAddress,
    enabled: isConnected,
  })

  if (!isConnected) return null

  return (
    <>
      <EarningsTracker
        watchTime={watchTime}
        todayEarnings={todayEarnings}
        dailyLimit={dailyLimit}
        isEarning={isEarning}
        isPaused={isPaused}
        onClick={() => setModalOpen(true)}
      />

      <EarningsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        todayEarnings={todayEarnings}
        dailyLimit={dailyLimit}
        watchRewards={data?.today.watchRewards ?? 0}
        commentRewards={data?.today.commentRewards ?? 0}
        unclaimedAmount={unclaimedAmount}
        resetInSeconds={resetInSeconds}
        onClaim={claimRewards}
      />

      {currentToast && (
        <RewardToast
          amount={currentToast.amount}
          reason={currentToast.reason}
          visible={true}
          onHide={hideCurrentToast}
        />
      )}

      <AttentionCheck
        open={attentionCheckVisible}
        onConfirm={() => handleAttentionCheck(true)}
        onTimeout={() => handleAttentionCheck(false)}
      />
    </>
  )
}
