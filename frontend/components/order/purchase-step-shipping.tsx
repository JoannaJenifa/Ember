'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShippingInfo } from '@/lib/types/order'
import { useTranslation } from '@/lib/i18n'

interface PurchaseStepShippingProps {
  shipping: ShippingInfo
  onNext: (shipping: ShippingInfo) => void
  onBack: () => void
}

export function PurchaseStepShipping({
  shipping: initialShipping,
  onNext,
  onBack,
}: PurchaseStepShippingProps) {
  const { t } = useTranslation()
  const [shipping, setShipping] = useState<ShippingInfo>(initialShipping)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!shipping.name.trim()) {
      newErrors.name = t('order.namePlaceholder')
    }
    if (!shipping.phone.trim()) {
      newErrors.phone = t('order.phonePlaceholder')
    } else if (!/^[0-9-+() ]+$/.test(shipping.phone)) {
      newErrors.phone = t('order.phonePlaceholder')
    }
    if (!shipping.address.trim()) {
      newErrors.address = t('order.addressPlaceholder')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onNext(shipping)
    }
  }

  const updateField = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="shipping-name">
          {t('order.name')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="shipping-name"
          placeholder={t('order.namePlaceholder')}
          value={shipping.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="shipping-phone">
          {t('order.phone')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="shipping-phone"
          placeholder={t('order.phonePlaceholder')}
          value={shipping.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="shipping-address">
          {t('order.address')} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="shipping-address"
          placeholder={t('order.addressPlaceholder')}
          value={shipping.address}
          onChange={(e) => updateField('address', e.target.value)}
          className={errors.address ? 'border-destructive' : ''}
          rows={3}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address}</p>
        )}
      </div>

      {/* Memo */}
      <div className="space-y-2">
        <Label htmlFor="shipping-memo">{t('order.memo')}</Label>
        <Input
          id="shipping-memo"
          placeholder={t('order.memoPlaceholder')}
          value={shipping.memo || ''}
          onChange={(e) => updateField('memo', e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('common.back')}
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-coral hover:bg-coral/90"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
