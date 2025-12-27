'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface PhotoGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  photos: string[]
  initialIndex?: number
}

export function PhotoGallery({ open, onOpenChange, photos, initialIndex = 0 }: PhotoGalleryProps) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setZoomed(false)
    }
  }, [open, initialIndex])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % photos.length)
    setZoomed(false)
  }, [photos.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length)
    setZoomed(false)
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onOpenChange(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, goNext, goPrev, onOpenChange])

  if (photos.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-background/95 backdrop-blur-sm">
        <DialogTitle className="sr-only">{t('common.view')}</DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Zoom toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomed(!zoomed)}
          className="absolute top-4 left-4 z-50"
        >
          {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
        </Button>

        {/* Image */}
        <div className="flex items-center justify-center w-full h-full overflow-auto">
          <div
            className={cn(
              'transition-transform duration-200',
              zoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'
            )}
            onClick={() => setZoomed(!zoomed)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setZoomed(false)
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentIndex ? 'bg-coral' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
