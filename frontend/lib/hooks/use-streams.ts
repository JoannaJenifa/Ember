import { useState, useEffect, useCallback, useRef } from 'react'
import type { LabangStream } from '@/lib/db/supabase'

interface UseStreamsOptions {
  walletAddress?: string
  status?: 'scheduled' | 'live' | 'ended'
  limit?: number
  offset?: number
}

export function useStreams(options: UseStreamsOptions = {}) {
  const [streams, setStreams] = useState<LabangStream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to track latest values without causing re-renders
  const optionsRef = useRef(options)
  optionsRef.current = options

  const fetchStreams = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      const opts = optionsRef.current
      if (opts.walletAddress) params.set('walletAddress', opts.walletAddress)
      if (opts.status) params.set('status', opts.status)
      if (opts.limit) params.set('limit', opts.limit.toString())
      if (opts.offset) params.set('offset', opts.offset.toString())

      const response = await fetch(`/api/sell/streams?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch streams')

      const data = await response.json()
      setStreams(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, []) // Stable callback - uses ref for values

  // Only refetch when key values change
  useEffect(() => {
    fetchStreams()
  }, [options.walletAddress, options.status, fetchStreams])

  const refetch = useCallback(() => {
    fetchStreams()
  }, [fetchStreams])

  const deleteStream = useCallback(async (streamId: string) => {
    try {
      const response = await fetch(`/api/sell/streams/${streamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete stream')

      setStreams((prev) => prev.filter((s) => s.id !== streamId))
      return true
    } catch (err) {
      console.error('Delete error:', err)
      return false
    }
  }, [])

  return { streams, loading, error, refetch, deleteStream }
}

export function useStream(streamId: string | null) {
  const [stream, setStream] = useState<LabangStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStream = useCallback(async () => {
    if (!streamId) {
      setStream(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sell/streams/${streamId}`)
      if (!response.ok) throw new Error('Failed to fetch stream')

      const data = await response.json()
      setStream(data.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [streamId])

  useEffect(() => {
    fetchStream()
  }, [fetchStream])

  return { stream, loading, error, refetch: fetchStream }
}
