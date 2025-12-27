'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ProfileUploadProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  aspectRatio?: 'square' | 'banner'
  error?: string
  disabled?: boolean
}

export function ProfileUpload({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  error,
  disabled,
}: ProfileUploadProps) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(t('errors.imageFileOnly'))
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('errors.fileSizeLimit'))
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch {
      setUploadError(t('errors.uploadFailed'))
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
    setUploadError(null)
  }

  const isBanner = aspectRatio === 'banner'

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed border-border',
          'flex items-center justify-center overflow-hidden',
          'transition-colors hover:border-coral/50',
          isBanner ? 'h-32' : 'h-40 w-40',
          error && 'border-destructive',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className={cn('object-cover', isBanner ? 'w-full h-full' : 'w-40 h-40')}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center gap-2 text-muted-foreground p-4"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                {isBanner ? <ImageIcon className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                <span className="text-sm">{t('seller.clickToUpload')}</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading || disabled}
        />
      </div>
      {(error || uploadError) && (
        <p className="text-sm text-destructive">{error || uploadError}</p>
      )}
    </div>
  )
}
