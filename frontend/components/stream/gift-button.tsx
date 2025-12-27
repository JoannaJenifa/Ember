'use client'

import { useState } from 'react'
import { type Address } from 'viem'
import { Button } from '@/components/ui/button'
import { Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GiftModal } from '@/components/gifts/gift-modal'
import { GiftAnimation, getGiftAnimationType } from '@/components/gifts/gift-animation'
import { useTranslation } from '@/lib/i18n'

interface GiftButtonProps {
  streamId: string
  sellerId: Address
  isConnected?: boolean
  onGiftSent?: (giftId: bigint, quantity: number, giftName: string) => void
  className?: string
}

export function GiftButton({
  streamId,
  sellerId,
  isConnected = false,
  onGiftSent,
  className,
}: GiftButtonProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animation, setAnimation] = useState<{
    type: ReturnType<typeof getGiftAnimationType>
    quantity: number
  } | null>(null)

  const handleGiftSuccess = (giftId: bigint, quantity: number, giftName: string) => {
    // Trigger animation
    setAnimation({
      type: getGiftAnimationType(giftId),
      quantity,
    })

    // Notify parent
    onGiftSent?.(giftId, quantity, giftName)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn('shrink-0', className)}
        onClick={() => setIsModalOpen(true)}
        disabled={!isConnected}
        title={t('gift.sendGift')}
      >
        <Gift className="h-4 w-4" />
      </Button>

      <GiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streamerId={sellerId}
        streamId={streamId}
        onSuccess={handleGiftSuccess}
      />

      {animation && (
        <GiftAnimation
          type={animation.type}
          quantity={animation.quantity}
          onComplete={() => setAnimation(null)}
        />
      )}
    </>
  )
}
