'use client'

import { useState, useEffect } from 'react'
import { type Address } from 'viem'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGifts, useSendGift, type GiftWithDisplay } from '@/lib/web3/gifts'
import { useVeryBalance } from '@/lib/web3/order-escrow'
import { formatUnits } from 'viem'
import { useTranslation } from '@/lib/i18n'

const QUANTITY_OPTIONS = [1, 5, 10]

interface GiftModalProps {
  isOpen: boolean
  onClose: () => void
  streamerId: Address
  streamId: string
  onSuccess?: (giftId: bigint, quantity: number, giftName: string) => void
}

export function GiftModal({
  isOpen,
  onClose,
  streamerId,
  streamId,
  onSuccess,
}: GiftModalProps) {
  const { t } = useTranslation()
  const { gifts, loading: loadingGifts } = useGifts()
  const { sendGift, loading: sending, error } = useSendGift()
  const { balance, refetch: refetchBalance } = useVeryBalance()

  const [selectedGift, setSelectedGift] = useState<GiftWithDisplay | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customQuantity, setCustomQuantity] = useState('')

  const effectiveQuantity = customQuantity ? parseInt(customQuantity, 10) || 0 : quantity
  const totalCost = selectedGift ? selectedGift.price * BigInt(effectiveQuantity) : 0n
  const hasEnoughBalance = balance >= totalCost

  useEffect(() => {
    if (isOpen) {
      refetchBalance()
      setSelectedGift(null)
      setQuantity(1)
      setCustomQuantity('')
    }
  }, [isOpen, refetchBalance])

  const handleSend = async () => {
    if (!selectedGift || effectiveQuantity <= 0) return

    const result = await sendGift({
      streamerId,
      giftId: selectedGift.id,
      quantity: effectiveQuantity,
      pricePerGift: selectedGift.price,
    })

    if (result) {
      onSuccess?.(selectedGift.id, effectiveQuantity, selectedGift.name)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t('gift.sendGift')}
          </DialogTitle>
        </DialogHeader>

        {loadingGifts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-coral" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gift Selection Grid */}
            <div className="grid grid-cols-4 gap-2">
              {gifts.map((gift) => (
                <button
                  key={gift.id.toString()}
                  onClick={() => setSelectedGift(gift)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                    'hover:border-coral hover:bg-coral/5',
                    selectedGift?.id === gift.id
                      ? 'border-coral bg-coral/10'
                      : 'border-border bg-background'
                  )}
                >
                  <span className="text-2xl">{gift.emoji}</span>
                  <span className="text-xs font-medium text-foreground">
                    {gift.name}
                  </span>
                  <span className="text-xs text-coral">
                    {gift.priceFormatted} VERY
                  </span>
                </button>
              ))}
            </div>

            {/* Quantity Selector */}
            {selectedGift && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('order.quantity')}:</p>
                <div className="flex gap-2">
                  {QUANTITY_OPTIONS.map((q) => (
                    <Button
                      key={q}
                      variant={quantity === q && !customQuantity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setQuantity(q)
                        setCustomQuantity('')
                      }}
                      className={cn(
                        quantity === q && !customQuantity && 'bg-coral hover:bg-coral/90'
                      )}
                    >
                      {q}
                    </Button>
                  ))}
                  <input
                    type="number"
                    placeholder={t('tips.customAmount')}
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    className={cn(
                      'w-24 px-3 py-1 text-sm rounded-md border',
                      'bg-background border-border text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-coral'
                    )}
                    min={1}
                  />
                </div>
              </div>
            )}

            {/* Total Cost */}
            {selectedGift && effectiveQuantity > 0 && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                <span className="text-sm text-muted-foreground">{t('order.total')}:</span>
                <span className="text-lg font-bold text-coral">
                  {formatUnits(totalCost, 18)} VERY
                </span>
              </div>
            )}

            {/* Balance Warning */}
            {selectedGift && !hasEnoughBalance && (
              <p className="text-sm text-destructive text-center">
                {t('order.insufficientBalance', { balance: formatUnits(balance, 18) })}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Send Button */}
            <Button
              className="w-full bg-coral hover:bg-coral/90 text-white"
              onClick={handleSend}
              disabled={!selectedGift || effectiveQuantity <= 0 || !hasEnoughBalance || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.sending')}
                </>
              ) : (
                t('gift.sendGift')
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t('gift.giftSent')}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
