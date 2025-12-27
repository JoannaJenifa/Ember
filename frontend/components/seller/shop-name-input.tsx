'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ShopNameInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function ShopNameInput({ value, onChange, error, disabled }: ShopNameInputProps) {
  const { t } = useTranslation()
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [debouncedValue, setDebouncedValue] = useState(value)

  // Debounce the value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 500)
    return () => clearTimeout(timer)
  }, [value])

  // Check availability when debounced value changes
  const checkAvailability = useCallback(async (name: string) => {
    if (name.length < 2) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch(`/api/sellers/check-name?name=${encodeURIComponent(name)}`)
      if (response.ok) {
        const data = await response.json()
        setIsAvailable(data.available)
      }
    } catch {
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    if (debouncedValue) {
      checkAvailability(debouncedValue)
    } else {
      setIsAvailable(null)
    }
  }, [debouncedValue, checkAvailability])

  return (
    <div className="space-y-2">
      <Label htmlFor="shopName">{t('register.shopName')}</Label>
      <div className="relative">
        <Input
          id="shopName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('register.shopNamePlaceholder')}
          disabled={disabled}
          className={cn(
            'pr-10',
            error && 'border-destructive',
            isAvailable === false && !error && 'border-destructive',
            isAvailable === true && 'border-green-500'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
          {!isChecking && isAvailable === false && <X className="h-4 w-4 text-destructive" />}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && isAvailable === false && (
        <p className="text-sm text-destructive">{t('seller.shopNameTaken')}</p>
      )}
      {!error && isAvailable === true && (
        <p className="text-sm text-green-500">{t('seller.shopNameAvailable')}</p>
      )}
    </div>
  )
}
