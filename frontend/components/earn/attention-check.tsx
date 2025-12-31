'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from '@/lib/i18n'

const TIMEOUT_SECONDS = 10

interface AttentionCheckProps {
  open: boolean
  onConfirm: () => void
  onTimeout: () => void
}

export function AttentionCheck({
  open,
  onConfirm,
  onTimeout,
}: AttentionCheckProps) {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS)

  useEffect(() => {
    if (!open) {
      setTimeLeft(TIMEOUT_SECONDS)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open, onTimeout])

  const progress = (timeLeft / TIMEOUT_SECONDS) * 100

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Eye className="h-6 w-6" />
            {t('earnings.attentionCheck')}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t('earnings.attentionDesc')}
          </p>

          <Button
            onClick={onConfirm}
            size="lg"
            className="w-full h-12 text-lg"
          >
            {t('earnings.continueWatching')}
          </Button>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {t('earnings.clickWithin', { seconds: timeLeft })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
