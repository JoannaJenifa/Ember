'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { ProductWithSeller } from '@/lib/types/product'
import { ShippingInfo } from '@/lib/types/order'
import { useAccount } from '@/lib/web3'
import { useCreateOrder } from '@/lib/web3/order-escrow'
import type { Address } from 'viem'
import { useTranslation } from '@/lib/i18n'

interface PurchaseStepPendingProps {
  product: ProductWithSeller
  quantity: number
  shipping: ShippingInfo
  onComplete: (orderId: string, txHash: string) => void
  onError: (error: string) => void
}

type TransactionStep = 'approve' | 'create' | 'saving' | 'done' | 'error'

export function PurchaseStepPending({
  product,
  quantity,
  shipping,
  onComplete,
  onError,
}: PurchaseStepPendingProps) {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { createOrder } = useCreateOrder()
  const [step, setStep] = useState<TransactionStep>('approve')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const executePurchase = async () => {
      if (!address || !product.seller) return

      try {
        setStep('approve')

        // Create order on chain
        setStep('create')
        // Convert from wei to VERY (18 decimals)
        const priceInVery = parseFloat(product.priceVery) / 1e18
        const result = await createOrder({
          seller: product.seller.wallet as Address,
          productId: product.id,
          amount: priceInVery * quantity,
        })

        if (!result) {
          throw new Error(t('errors.submitFailed'))
        }

        // Save to database
        setStep('saving')
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onchainOrderId: result.orderId,
            buyerAddress: address,
            sellerId: product.seller.id,
            productId: product.id,
            quantity,
            totalPriceVery: priceInVery * quantity,
            shippingName: shipping.name,
            shippingPhone: shipping.phone,
            shippingAddress: shipping.address,
            shippingMemo: shipping.memo,
            txHash: result.txHash,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || t('errors.submitFailed'))
        }

        const orderData = await response.json()
        setStep('done')

        // Small delay for visual feedback
        setTimeout(() => {
          onComplete(orderData.data.id, result.txHash)
        }, 1000)
      } catch (err) {
        setStep('error')
        const message = err instanceof Error ? err.message : t('common.error')
        setErrorMessage(message)
        onError(message)
      }
    }

    executePurchase()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getStepStatus = (targetStep: TransactionStep) => {
    const stepOrder: TransactionStep[] = ['approve', 'create', 'saving', 'done']
    const currentIndex = stepOrder.indexOf(step)
    const targetIndex = stepOrder.indexOf(targetStep)

    if (step === 'error') return 'error'
    if (targetIndex < currentIndex) return 'complete'
    if (targetIndex === currentIndex) return 'current'
    return 'pending'
  }

  const StepIndicator = ({
    stepName,
    label,
  }: {
    stepName: TransactionStep
    label: string
  }) => {
    const status = getStepStatus(stepName)

    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {status === 'complete' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {status === 'current' && (
            <Loader2 className="h-5 w-5 text-coral animate-spin" />
          )}
          {status === 'pending' && (
            <div className="h-5 w-5 rounded-full border-2 border-muted" />
          )}
          {status === 'error' && (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
        <span
          className={
            status === 'current'
              ? 'text-foreground font-medium'
              : status === 'complete'
              ? 'text-muted-foreground'
              : 'text-muted-foreground/50'
          }
        >
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {/* Progress Steps */}
      <div className="space-y-4">
        <StepIndicator stepName="approve" label={t('common.loading')} />
        <StepIndicator stepName="create" label={t('order.processingPayment')} />
        <StepIndicator stepName="saving" label={t('common.saving')} />
        <StepIndicator stepName="done" label={t('common.success')} />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Notice */}
      {step !== 'error' && step !== 'done' && (
        <p className="text-sm text-muted-foreground text-center">
          {t('wallet.connecting')}
        </p>
      )}
    </div>
  )
}
