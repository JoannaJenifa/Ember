'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Radio, Youtube, CheckCircle } from 'lucide-react'
import { useStreamForm } from '@/lib/hooks/use-stream-form'
import { useSeller } from '@/lib/hooks/use-seller'
import { useAccount } from '@/lib/web3/providers'
import { ImageUpload } from '@/components/product/image-upload'
import { useTranslation } from '@/lib/i18n'
import type { LabangStream } from '@/lib/db/supabase'
import Link from 'next/link'
import { DateTimePicker } from '@/components/ui/datetime-picker'

export default function NewStreamPage() {
  const router = useRouter()
  const { address } = useAccount()
  const { seller, loading: sellerLoading } = useSeller(address)
  const { t, locale } = useTranslation()

  const [createdStream, setCreatedStream] = useState<LabangStream | null>(null)

  const { formData, loading, errors, updateField, submit, reset } = useStreamForm({
    walletAddress: address || '',
    shopName: seller?.shopName,
    category: seller?.category,
    locale,
    onSuccess: (stream) => {
      setCreatedStream(stream)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  if (sellerLoading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </main>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{t('seller.registerFirst')}</p>
            <Link href="/sell/register">
              <Button className="mt-4">{t('seller.register')}</Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

  // Show success after creation
  if (createdStream) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('stream.streamCreated')}</h1>
            <p className="text-muted-foreground mb-6">
              Your YouTube stream has been registered. It will appear on the Live page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/sell/streams')}>
                {t('stream.viewAllStreams')}
              </Button>
              <Button onClick={() => router.push(`/live/${createdStream.id}`)}>
                View Stream
              </Button>
              <Button variant="outline" onClick={() => {
                setCreatedStream(null)
                reset()
              }}>
                {t('stream.createAnother')}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('stream.scheduleStream')}</h1>
          <p className="text-muted-foreground">{t('stream.scheduleStreamDesc')}</p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <p className="text-xs text-muted-foreground">
                Paste your YouTube live stream URL. Viewers will watch directly from YouTube.
              </p>
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
                {t('stream.leaveEmptyForLive')}
              </p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>{t('stream.thumbnail')}</Label>
              <ImageUpload
                images={formData.thumbnail ? [formData.thumbnail] : []}
                onChange={(images) => updateField('thumbnail', images[0] || '')}
                disabled={loading}
                maxImages={1}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sell/streams')}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="bg-coral hover:bg-coral/90">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Radio className="mr-2 h-4 w-4" />
                    {t('stream.scheduleStream')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
