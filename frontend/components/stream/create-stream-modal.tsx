'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Youtube, CheckCircle } from 'lucide-react'
import { useStreamForm } from '@/lib/hooks/use-stream-form'
import { ImageUpload } from '@/components/product/image-upload'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import type { LabangStream } from '@/lib/db/supabase'
import { useTranslation } from '@/lib/i18n'

interface CreateStreamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  shopName?: string
  category?: string
  onSuccess?: (stream: LabangStream) => void
}

export function CreateStreamModal({
  open,
  onOpenChange,
  walletAddress,
  shopName,
  category,
  onSuccess,
}: CreateStreamModalProps) {
  const { t } = useTranslation()
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdStream, setCreatedStream] = useState<LabangStream | null>(null)

  const { formData, loading, errors, updateField, submit, reset } = useStreamForm({
    walletAddress,
    shopName,
    category,
    onSuccess: (stream) => {
      setCreatedStream(stream)
      setShowSuccess(true)
      onSuccess?.(stream)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setShowSuccess(false)
      setCreatedStream(null)
      reset()
    }, 300)
  }

  if (showSuccess && createdStream) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <DialogHeader>
            <DialogTitle>{t('stream.streamCreated')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Your YouTube stream has been registered!
          </p>
          <DialogFooter className="justify-center">
            <Button onClick={handleClose}>{t('common.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('stream.scheduleStream')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('stream.streamTitle')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Stream title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleKo">{t('stream.streamTitleKo')}</Label>
              <Input
                id="titleKo"
                value={formData.titleKo}
                onChange={(e) => updateField('titleKo', e.target.value)}
                placeholder={t('stream.streamTitle')}
              />
            </div>
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              YouTube Live URL *
            </Label>
            <Input
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => updateField('youtubeUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={errors.youtubeUrl ? 'border-destructive' : ''}
            />
            {errors.youtubeUrl && (
              <p className="text-xs text-destructive">{errors.youtubeUrl}</p>
            )}
          </div>

          {/* Scheduled At */}
          <div className="space-y-2">
            <Label>{t('stream.streamDate')}</Label>
            <DateTimePicker
              date={formData.scheduledAt ? new Date(formData.scheduledAt) : undefined}
              onDateChange={(date) => updateField('scheduledAt', date?.toISOString() || '')}
              minDate={new Date()}
              placeholder={t('stream.leaveEmptyForLive')}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to go live immediately
            </p>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail Image (Optional)</Label>
            <ImageUpload
              images={formData.thumbnail ? [formData.thumbnail] : []}
              onChange={(images) => updateField('thumbnail', images[0] || '')}
              disabled={loading}
              maxImages={1}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                t('stream.scheduleStream')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
