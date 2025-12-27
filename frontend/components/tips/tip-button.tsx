'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TipModal } from './tip-modal'
import { type Address } from 'viem'
import { useTranslation } from '@/lib/i18n'
import { useSendTip } from '@/lib/web3/tips'
import { usePublicClient } from '@/lib/web3'
import { toast } from 'sonner'

const EXPLORER_URL = 'https://sepolia.basescan.org/tx/'

export interface TipData {
  txHash: string
  amount: string
  message?: string
  streamerId: Address
}

interface TipButtonProps {
  streamerId: Address
  streamId: string
  isConnected?: boolean
  onTipSuccess?: (tip: TipData) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function TipButton({
  streamerId,
  streamId,
  isConnected = false,
  onTipSuccess,
  className,
  variant = 'outline',
  size = 'icon',
}: TipButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()
  const { sendTip } = useSendTip()
  const { publicClient } = usePublicClient()

  const handleSendTip = useCallback(async (params: { streamerId: Address; amount: string; message?: string }) => {
    // Show loading toast
    const loadingToast = toast.loading(t('tips.sending'))

    try {
      const result = await sendTip(params)

      if (!result) {
        throw new Error(t('tips.sendFailed'))
      }

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: result.txHash as `0x${string}` })
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Optimistic update
      onTipSuccess?.({
        txHash: result.txHash,
        amount: params.amount,
        message: params.message,
        streamerId: params.streamerId,
      })

      // Show success toast with View TX button
      toast.success(t('tips.tipSent'), {
        description: `${params.amount} VERY`,
        action: {
          label: t('common.viewTx'),
          onClick: () => window.open(`${EXPLORER_URL}${result.txHash}`, '_blank'),
        },
        duration: 10000,
      })
    } catch (err) {
      toast.dismiss(loadingToast)
      const errorMessage = err instanceof Error ? err.message : t('common.error')
      toast.error(t('common.error'), { description: errorMessage })
    }
  }, [sendTip, publicClient, onTipSuccess, t])

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn('shrink-0', className)}
        onClick={() => setIsModalOpen(true)}
        disabled={!isConnected}
        title={t('tips.sendTip')}
      >
        <DollarSign className="h-4 w-4" />
        {size !== 'icon' && <span className="ml-2">{t('tips.tip')}</span>}
      </Button>

      <TipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streamerId={streamerId}
        streamId={streamId}
        onSendTip={handleSendTip}
      />
    </>
  )
}
