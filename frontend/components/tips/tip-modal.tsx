'use client'

import { useState, useEffect, useMemo } from 'react'
import { type Address, formatUnits } from 'viem'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSendTip, calculateTipFee, getPlatformFeePercent } from '@/lib/web3/tips'
import { useVeryBalance } from '@/lib/web3/order-escrow'
import { useTranslation } from '@/lib/i18n'
import { getDemoTip, type Locale } from '@/lib/demo/templates'

const PRESET_AMOUNTS = ['10', '50', '100', '500']

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  streamerId: Address
  streamId: string
  onSendTip?: (params: { streamerId: Address; amount: string; message?: string }) => void
}

export function TipModal({
  isOpen,
  onClose,
  streamerId,
  streamId,
  onSendTip,
}: TipModalProps) {
  const { t, locale } = useTranslation()
  const { balance, refetch: refetchBalance } = useVeryBalance()

  // Get random demo tip data for faster demos
  const demoTip = useMemo(() => getDemoTip(locale as Locale), [locale])
  const [amount, setAmount] = useState(demoTip.amount)
  const [message, setMessage] = useState(demoTip.message)

  const feeInfo = calculateTipFee(amount)
  const hasEnoughBalance = balance >= BigInt(Math.floor(parseFloat(amount || '0') * 1e18))
  const platformFeePercent = getPlatformFeePercent()

  useEffect(() => {
    if (isOpen) {
      refetchBalance()
      // Generate new random demo on each open
      const newDemo = getDemoTip(locale as Locale)
      setAmount(newDemo.amount)
      setMessage(newDemo.message)
    }
  }, [isOpen, refetchBalance, locale])

  const handlePresetClick = (preset: string) => {
    setAmount(preset)
  }

  const handleSend = () => {
    if (!amount || parseFloat(amount) <= 0) return

    // Close dialog first, then trigger the transaction
    onClose()
    onSendTip?.({
      streamerId,
      amount,
      message: message || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">💰</span>
            {t('tips.sendTip')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Amount Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('tips.selectAmount')}</p>
            <div className="flex gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    'flex-1',
                    amount === preset && 'bg-coral hover:bg-coral/90'
                  )}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('tips.customAmount')}</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={t('tips.amount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-background border-border"
                min={0}
                step={0.1}
              />
              <span className="text-sm font-medium text-coral">VERY</span>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('tips.message')}</p>
            <Textarea
              placeholder={t('tips.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-background border-border resize-none"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>

          {/* Fee Display */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 rounded-lg bg-background space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('tips.fee', { percent: platformFeePercent })}</span>
                <span className="text-foreground">{feeInfo.fee} VERY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('tips.sellerReceives')}</span>
                <span className="text-foreground">{feeInfo.netAmount} VERY</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-border">
                <span className="text-foreground">{t('order.total')}:</span>
                <span className="text-coral">{feeInfo.total} VERY</span>
              </div>
            </div>
          )}

          {/* Balance Warning */}
          {amount && !hasEnoughBalance && parseFloat(amount) > 0 && (
            <p className="text-sm text-destructive text-center">
              {t('order.insufficientBalance', { balance: formatUnits(balance, 18) })}
            </p>
          )}

          {/* Send Button */}
          <Button
            className="w-full bg-coral hover:bg-coral/90 text-white"
            onClick={handleSend}
            disabled={!amount || parseFloat(amount) <= 0 || !hasEnoughBalance}
          >
            {t('tips.sendTip')}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('tips.tipDesc')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
