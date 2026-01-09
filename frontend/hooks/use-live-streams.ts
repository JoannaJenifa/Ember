'use client'

import { useState, useEffect, useCallback } from 'react'
import { StreamWithSeller } from '@/lib/types/stream'

// TODO: Replace with real API/indexer integration when available
// Streams are not on-chain - they require a backend service

export function useLiveStreams(category?: string) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Fetch from API when stream backend is implemented
      // const params = new URLSearchParams()
      // if (category && category !== 'all') params.set('category', category)
      // const res = await fetch(`/api/streams/live?${params}`)
      // const data = await res.json()
      // setStreams(data.streams)
      setStreams([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}

export function useUpcomingStreams(hours = 24) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Fetch from API when stream backend is implemented
      setStreams([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [hours])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}

export function useReplays(options?: { category?: string; sort?: 'popular' | 'latest'; limit?: number }) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Fetch from API when stream backend is implemented
      setStreams([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [options?.category, options?.sort, options?.limit])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}
