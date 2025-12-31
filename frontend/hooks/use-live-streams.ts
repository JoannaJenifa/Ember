'use client'

import useSWR from 'swr'
import { LabangStream, LabangSeller } from '@/lib/db/supabase'

export interface StreamWithSeller extends LabangStream {
  seller?: LabangSeller | null
  category?: string
}

interface StreamsResponse {
  success: boolean
  streams: StreamWithSeller[]
}

const fetcher = async (url: string): Promise<StreamWithSeller[]> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch streams')
  const data: StreamsResponse = await res.json()
  return data.streams
}

export function useLiveStreams(category?: string) {
  const params = new URLSearchParams()
  if (category && category !== 'all') {
    params.set('category', category)
  }
  const queryString = params.toString()
  const url = `/api/streams/live${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<StreamWithSeller[]>(
    url,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    streams: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export function useUpcomingStreams(hours = 24) {
  const url = `/api/streams/upcoming?hours=${hours}`

  const { data, error, isLoading, mutate } = useSWR<StreamWithSeller[]>(
    url,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    streams: data ?? [],
    isLoading,
    error,
    mutate,
  }
}

export function useReplays(options?: { category?: string; sort?: 'popular' | 'latest'; limit?: number }) {
  const params = new URLSearchParams()
  if (options?.category && options.category !== 'all') {
    params.set('category', options.category)
  }
  if (options?.sort) {
    params.set('sort', options.sort)
  }
  if (options?.limit) {
    params.set('limit', options.limit.toString())
  }
  const queryString = params.toString()
  const url = `/api/streams/replays${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<StreamWithSeller[]>(
    url,
    fetcher
  )

  return {
    streams: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
