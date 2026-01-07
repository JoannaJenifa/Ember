'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LabangStream } from './use-streams';
import { getDemoStream } from '@/lib/demo/templates';

interface StreamFormData {
  title: string;
  titleKo: string;
  thumbnail: string;
  scheduledAt: string;
  productIds: string[];
  youtubeUrl: string;
}

interface StreamFormErrors {
  title?: string;
  scheduledAt?: string;
  youtubeUrl?: string;
}

interface UseStreamFormOptions {
  stream?: LabangStream | null;
  walletAddress: string;
  shopName?: string;
  category?: string;
  onSuccess?: (stream: LabangStream) => void;
}

function getRandomStreamData(): StreamFormData {
  const template = getDemoStream();
  return {
    title: template.title,
    titleKo: '',
    thumbnail: '',
    scheduledAt: '',
    productIds: [],
    youtubeUrl: template.youtubeUrl,
  };
}

export function useStreamForm({
  stream,
  walletAddress,
  shopName,
  category,
  onSuccess,
}: UseStreamFormOptions) {
  const initialFormData = useMemo(() => getRandomStreamData(), []);
  const [formData, setFormData] = useState<StreamFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<StreamFormErrors>({});

  const isEditing = !!stream;

  useEffect(() => {
    if (stream) {
      setFormData({
        title: stream.title || '',
        titleKo: stream.title_ko || '',
        thumbnail: stream.thumbnail || '',
        scheduledAt: stream.scheduled_at || '',
        productIds: [],
        youtubeUrl: stream.youtube_url || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [stream, initialFormData]);

  const updateField = useCallback(
    <K extends keyof StreamFormData>(field: K, value: StreamFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const validate = useCallback((): boolean => {
    const newErrors: StreamFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    } else if (
      !formData.youtubeUrl.includes('youtube.com') &&
      !formData.youtubeUrl.includes('youtu.be')
    ) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const submit = useCallback(async () => {
    if (!validate()) return null;

    setLoading(true);

    try {
      // TODO: Implement stream creation/update
      throw new Error('Stream creation not yet implemented for Movement');
    } catch (err) {
      console.error('Stream form error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, validate]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  return {
    formData,
    loading,
    errors,
    isEditing,
    updateField,
    submit,
    reset,
  };
}
