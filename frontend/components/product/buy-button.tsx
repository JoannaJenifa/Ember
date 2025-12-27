'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check, ShoppingCart, AlertCircle } from 'lucide-react'
import { useAccount } from '@/lib/web3'
import { useVeryBalance } from '@/lib/web3/order-escrow'
import { formatUnits } from 'viem'
import { cn } from '@/lib/utils'
import { ProductWithSeller } from '@/lib/types/product'
import { PurchaseModal } from '@/components/order/purchase-modal'
import { useTranslation } from '@/lib/i18n'

interface BuyButtonProps {
  product: ProductWithSeller
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  onSuccess?: (orderId: string, txHash: string) => void
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error'

export function BuyButton({
  product,
  className,
  variant = 'default',
  size = 'default',
  onSuccess,
}: BuyButtonProps) {
  const { t } = useTranslation()
  const { address, isConnected } = useAccount()
  const { balance, refetch: refetchBalance } = useVeryBalance()
  const [state, setState] = useState<ButtonState>('idle')
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const priceVery = parseFloat(product.priceVery)
  const hasEnoughBalance = balance >= BigInt(Math.floor(priceVery * 1e18))
  const balanceFormatted = formatUnits(balance, 18)

  const handleClick = async () => {
    setErrorMessage(null)

    // Check wallet connection
    if (!isConnected || !address) {
      setErrorMessage(t('errors.walletNotConnected'))
      setState('error')
      setTimeout(() => setState('idle'), 3000)
      return
    }

    // Refresh balance
    await refetchBalance()

    // Check balance
    if (!hasEnoughBalance) {
      setErrorMessage(t('order.insufficientBalance', { balance: parseFloat(balanceFormatted).toFixed(2) }))
      setState('error')
      setTimeout(() => setState('idle'), 3000)
      return
    }

    // Open purchase modal
    setShowModal(true)
  }

  const handlePurchaseSuccess = (orderId: string, txHash: string) => {
    setState('success')
    setShowModal(false)
    onSuccess?.(orderId, txHash)
    setTimeout(() => setState('idle'), 3000)
  }

  const handlePurchaseError = (error: string) => {
    setErrorMessage(error)
    setState('error')
    setShowModal(false)
    setTimeout(() => setState('idle'), 3000)
  }

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('order.processingPayment')}</span>
          </>
        )
      case 'success':
        return (
          <>
            <Check className="h-4 w-4" />
            <span>{t('order.orderConfirmation')}</span>
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>{t('common.retry')}</span>
          </>
        )
      default:
        return (
          <>
            <ShoppingCart className="h-4 w-4" />
            <span>{t('order.buyNow')}</span>
          </>
        )
    }
  }

  const getButtonVariant = () => {
    if (state === 'success') return 'default'
    if (state === 'error') return 'destructive'
    return variant
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <Button
          variant={getButtonVariant()}
          size={size}
          className={cn(
            'gap-2 transition-all',
            state === 'success' && 'bg-green-600 hover:bg-green-700',
            className
          )}
          onClick={handleClick}
          disabled={state === 'loading' || !product.isActive || (parseInt(String(product.inventory)) || 0) <= 0}
        >
          {getButtonContent()}
        </Button>
        {errorMessage && (
          <p className="text-xs text-destructive text-center">{errorMessage}</p>
        )}
      </div>

      <PurchaseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        product={product}
        onSuccess={handlePurchaseSuccess}
        onError={handlePurchaseError}
        onLoading={(isLoading) => setState(isLoading ? 'loading' : 'idle')}
      />
    </>
  )
}
