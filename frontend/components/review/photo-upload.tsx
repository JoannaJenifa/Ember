'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface PhotoUploadProps {
  photos: File[]
  onChange: (photos: File[]) => void
  maxPhotos?: number
  disabled?: boolean
}

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 3,
  disabled = false,
}: PhotoUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = maxPhotos - photos.length
    const toAdd = files.slice(0, remaining)

    if (toAdd.length === 0) return

    // Create previews
    const newPreviews = toAdd.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])

    onChange([...photos, ...toAdd])

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)

    // Revoke object URL
    URL.revokeObjectURL(previews[index])
    const newPreviews = previews.filter((_, i) => i !== index)

    setPreviews(newPreviews)
    onChange(newPhotos)
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('review.photoLimit', { count: maxPhotos })}</p>

      <div className="flex flex-wrap gap-2">
        {/* Existing photos */}
        {photos.map((_, index) => (
          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previews[index]}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className={cn(
                'absolute top-1 right-1 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity',
                disabled && 'cursor-not-allowed'
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="w-20 h-20 flex flex-col items-center justify-center gap-1 border-dashed"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('review.addPhotos')}</span>
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
