'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductWithSeller } from '@/lib/types/product'
import { ShippingInfo } from '@/lib/types/order'
import { PurchaseStepQuantity } from './purchase-step-quantity'
import { PurchaseStepShipping } from './purchase-step-shipping'
import { PurchaseStepSummary } from './purchase-step-summary'
import { useTranslation } from '@/lib/i18n'
import { getDemoShipping, type Locale } from '@/lib/demo/templates'

export interface PurchaseDetails {
  product: ProductWithSeller
  quantity: number
  shipping: ShippingInfo
}

interface PurchaseModalProps {
  open: boolean
  onClose: () => void
  product: ProductWithSeller
  onConfirmPurchase?: (details: PurchaseDetails) => void
  onSuccess?: (orderId: string, txHash: string) => void
  onError?: (error: string) => void
  onLoading?: (isLoading: boolean) => void
}

type PurchaseStep = 'quantity' | 'shipping' | 'summary'

export function PurchaseModal({
  open,
  onClose,
  product,
  onConfirmPurchase,
  onSuccess,
  onError,
  onLoading,
}: PurchaseModalProps) {
  const { t, locale } = useTranslation()
  // Get random demo shipping data for faster demos
  const demoShipping = useMemo(() => getDemoShipping(locale as Locale), [])
  const [step, setStep] = useState<PurchaseStep>('quantity')
  const [quantity, setQuantity] = useState(1)
  const [shipping, setShipping] = useState<ShippingInfo>(demoShipping)

  const handleClose = () => {
    setStep('quantity')
    setQuantity(1)
    setShipping(demoShipping)
    onClose()
  }

  const handleQuantityNext = (qty: number) => {
    setQuantity(qty)
    setStep('shipping')
  }

  const handleShippingNext = (info: ShippingInfo) => {
    setShipping(info)
    setStep('summary')
  }

  const handleConfirm = () => {
    // Close dialog first, then trigger transaction
    handleClose()
    onConfirmPurchase?.({ product, quantity, shipping })
  }

  const getStepTitle = () => {
    switch (step) {
      case 'quantity':
        return t('order.selectQuantity')
      case 'shipping':
        return t('order.shippingInfo')
      case 'summary':
        return t('order.orderConfirmation')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>

        {step === 'quantity' && (
          <PurchaseStepQuantity
            product={product}
            quantity={quantity}
            onNext={handleQuantityNext}
            onCancel={handleClose}
          />
        )}

        {step === 'shipping' && (
          <PurchaseStepShipping
            shipping={shipping}
            onNext={handleShippingNext}
            onBack={() => setStep('quantity')}
          />
        )}

        {step === 'summary' && (
          <PurchaseStepSummary
            product={product}
            quantity={quantity}
            shipping={shipping}
            onConfirm={handleConfirm}
            onBack={() => setStep('shipping')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
