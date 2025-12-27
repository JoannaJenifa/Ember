'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  onUploadingChange?: (uploading: boolean) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ images, onChange, onUploadingChange, maxImages = 5, disabled }: ImageUploadProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)

  const updateUploading = (value: boolean) => {
    setUploading(value)
    onUploadingChange?.(value)
  }
  const [dragActive, setDragActive] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', `product-${Date.now()}-${file.name}`)

    try {
      const response = await fetch('/api/ipfs/file', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      return data.gatewayUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled || uploading) return

      const fileArray = Array.from(files)
      const remaining = maxImages - images.length
      const filesToUpload = fileArray.slice(0, remaining)

      if (filesToUpload.length === 0) return

      updateUploading(true)
      const uploadPromises = filesToUpload.map(uploadFile)
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((url): url is string => url !== null)

      onChange([...images, ...successfulUploads])
      updateUploading(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, maxImages, disabled, uploading, onUploadingChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const canUpload = images.length < maxImages && !disabled

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canUpload && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 transition-colors text-center',
            dragActive ? 'border-coral bg-coral/5' : 'border-border hover:border-coral/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-coral" />
              <p className="text-sm text-muted-foreground">{t('product.uploadImages')}...</p>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">{t('product.uploadImages')}</p>
              <p className="text-xs text-muted-foreground">
                {t('review.photoLimit', { count: maxImages })} ({images.length}/{maxImages})
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled || uploading}
              />
            </label>
          )}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${t('product.images')} ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-coral text-white text-xs px-1.5 py-0.5 rounded">
                  {t('product.mainImage')}
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !canUpload && (
        <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-lg">
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('product.images')}</p>
        </div>
      )}
    </div>
  )
}
