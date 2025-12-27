'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SELLER_CATEGORIES } from './seller-categories'
import { useTranslation } from '@/lib/i18n'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function CategorySelect({ value, onChange, error, disabled }: CategorySelectProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{t('register.category')}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={t('register.selectCategory')} />
        </SelectTrigger>
        <SelectContent>
          {SELLER_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.labelKo}</span>
                <span className="text-muted-foreground text-xs">({category.labelEn})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
