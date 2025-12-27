'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, ExternalLink, Gift } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTranslation } from '@/lib/i18n'

interface ReviewSuccessProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  txHash: string
  reward?: number
}

export function ReviewSuccess({ open, onOpenChange, txHash, reward = 5 }: ReviewSuccessProps) {
  const { t } = useTranslation()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open && !showConfetti) {
      setShowConfetti(true)
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#FFD93D', '#6BCB77'],
      })
    }

    if (!open) {
      setShowConfetti(false)
    }
  }, [open, showConfetti])

  const explorerUrl = `https://www.veryscan.io/tx/${txHash}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogTitle className="sr-only">{t('review.reviewSubmitted')}</DialogTitle>

        <div className="py-6 space-y-4">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 animate-bounce">
                <Gift className="h-6 w-6 text-gold" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">{t('review.reviewSubmitted')}</h3>
            <p className="text-muted-foreground">{t('review.thankYou')}</p>
          </div>

          {/* Reward */}
          <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 animate-in slide-in-from-bottom duration-500 delay-200">
            <p className="text-lg font-bold text-gold">+{reward} VERY</p>
            <p className="text-sm text-muted-foreground">{t('review.thankYou')}</p>
          </div>

          {/* Transaction link */}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-coral hover:underline"
          >
            {t('common.view')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full bg-coral hover:bg-coral/90">
          {t('common.confirm')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
