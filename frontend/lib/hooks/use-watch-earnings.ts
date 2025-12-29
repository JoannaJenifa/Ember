'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const HEARTBEAT_INTERVAL = 30000 // 30 seconds

export interface Reward {
  type: 'watch_5min' | 'watch_30min'
  amount: number
}

interface HeartbeatResponse {
  continue: boolean
  attentionCheck: boolean
  rewards: Reward[]
  totalWatchTime: number
  dailyCapReached?: boolean
}

interface UseWatchEarningsOptions {
  streamId: string
  userAddress: string | undefined
  isConnected: boolean
  onReward?: (reward: Reward) => void
  onAttentionCheck?: () => void
}

export function useWatchEarnings({
  streamId,
  userAddress,
  isConnected,
  onReward,
  onAttentionCheck,
}: UseWatchEarningsOptions) {
  const [watchTime, setWatchTime] = useState(0)
  const [isEarning, setIsEarning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [attentionCheckVisible, setAttentionCheckVisible] = useState(false)
  const [dailyCapReached, setDailyCapReached] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  const sendHeartbeat = useCallback(async () => {
    if (!streamId || !userAddress || !isActiveRef.current || isPaused) return

    try {
      const res = await fetch('/api/earn/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, userAddress }),
      })

      if (!res.ok) throw new Error('Heartbeat failed')

      const data: HeartbeatResponse = await res.json()

      setWatchTime(data.totalWatchTime)

      if (data.dailyCapReached) {
        setDailyCapReached(true)
      }

      if (data.attentionCheck) {
        setAttentionCheckVisible(true)
        setIsPaused(true)
        onAttentionCheck?.()
      }

      if (data.rewards?.length > 0) {
        data.rewards.forEach(r => onReward?.(r))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [streamId, userAddress, isPaused, onReward, onAttentionCheck])

  const handleAttentionCheck = useCallback(async (passed: boolean) => {
    if (!userAddress) return

    try {
      const res = await fetch('/api/earn/attention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, userAddress, passed }),
      })

      if (!res.ok) throw new Error('Attention check failed')

      const data = await res.json()

      setAttentionCheckVisible(false)
      if (data.continue) {
        setIsPaused(false)
      } else {
        setIsEarning(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [streamId, userAddress])

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true)
      } else if (!attentionCheckVisible) {
        setIsPaused(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [attentionCheckVisible])

  // Start/stop earning based on connection status
  useEffect(() => {
    if (isConnected && userAddress && streamId) {
      setIsEarning(true)
    } else {
      setIsEarning(false)
    }
  }, [isConnected, userAddress, streamId])

  // Heartbeat interval
  useEffect(() => {
    if (!isEarning || isPaused || !userAddress) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Send initial heartbeat
    sendHeartbeat()

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEarning, isPaused, userAddress, sendHeartbeat])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
    }
  }, [])

  return {
    watchTime,
    isEarning,
    isPaused,
    attentionCheckVisible,
    dailyCapReached,
    error,
    handleAttentionCheck,
  }
}
