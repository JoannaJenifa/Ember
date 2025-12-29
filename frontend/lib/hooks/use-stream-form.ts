import { useState, useEffect, useCallback, useMemo } from 'react'
import type { LabangStream } from '@/lib/db/supabase'
import type { Locale } from '@/lib/i18n'
import { getDemoStream } from '@/lib/demo/templates'

interface StreamFormData {
  title: string
  titleKo: string
  thumbnail: string
  scheduledAt: string
  productIds: string[]
  youtubeUrl: string
}

interface StreamFormErrors {
  title?: string
  scheduledAt?: string
  youtubeUrl?: string
}

interface UseStreamFormOptions {
  stream?: LabangStream | null
  walletAddress: string
  shopName?: string
  category?: string
  locale?: Locale
  onSuccess?: (stream: LabangStream) => void
}

// Get random demo data for stream form
function getRandomStreamData(locale: Locale): StreamFormData {
  const template = getDemoStream(locale)
  const templateOther = getDemoStream(locale === 'en' ? 'ko' : 'en')
  return {
    title: locale === 'en' ? template.title : templateOther.title,
    titleKo: locale === 'ko' ? template.title : templateOther.title,
    thumbnail: '',
    scheduledAt: '',
    productIds: [],
    youtubeUrl: template.youtubeUrl,
  }
}

export function useStreamForm({ stream, walletAddress, shopName, category, locale = 'en', onSuccess }: UseStreamFormOptions) {
  // useMemo with empty deps to only generate random data once on mount
  const initialFormData = useMemo(() => getRandomStreamData(locale), [])
  const [formData, setFormData] = useState<StreamFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<StreamFormErrors>({})

  const isEditing = !!stream

  useEffect(() => {
    if (stream) {
      setFormData({
        title: stream.title || '',
        titleKo: stream.title_ko || '',
        thumbnail: stream.thumbnail || '',
        scheduledAt: stream.scheduled_at || '',
        productIds: [],
        youtubeUrl: stream.youtube_url || '',
      })
    } else {
      setFormData(initialFormData)
    }
  }, [stream, initialFormData])

  const updateField = useCallback(<K extends keyof StreamFormData>(
    field: K,
    value: StreamFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: StreamFormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required'
    } else if (!formData.youtubeUrl.includes('youtube.com') && !formData.youtubeUrl.includes('youtu.be')) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const submit = useCallback(async () => {
    if (!validate()) return null

    setLoading(true)

    try {
      const url = isEditing
        ? `/api/sell/streams/${stream.id}`
        : '/api/sell/streams'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          shopName,
          category,
          title: formData.title,
          titleKo: formData.titleKo || null,
          thumbnail: formData.thumbnail || null,
          scheduledAt: formData.scheduledAt || null,
          productIds: formData.productIds,
          youtubeUrl: formData.youtubeUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save stream')
      }

      const result = await response.json()
      onSuccess?.(result.data)
      return result.data
    } catch (err) {
      console.error('Stream form error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [formData, walletAddress, shopName, category, isEditing, stream, validate, onSuccess])

  const reset = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
  }, [initialFormData])

  return {
    formData,
    loading,
    errors,
    isEditing,
    updateField,
    submit,
    reset,
  }
}
