'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShopNameInput } from './shop-name-input'
import { CategorySelect } from './category-select'
import { useTranslation } from '@/lib/i18n'

export interface BasicInfoData {
  shopName: string
  shopNameKo: string
  category: string
  description: string
}

interface RegistrationStepBasicProps {
  data: BasicInfoData
  onChange: (data: BasicInfoData) => void
  errors: Partial<Record<keyof BasicInfoData, string>>
}

export function RegistrationStepBasic({ data, onChange, errors }: RegistrationStepBasicProps) {
  const { t } = useTranslation()

  const updateField = <K extends keyof BasicInfoData>(field: K, value: BasicInfoData[K]) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('register.basicInfo')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('seller.enterSellerInfo')}
        </p>
      </div>

      <ShopNameInput
        value={data.shopName}
        onChange={(v) => updateField('shopName', v)}
        error={errors.shopName}
      />

      <div className="space-y-2">
        <Label htmlFor="shopNameKo">{t('register.shopNameKo')}</Label>
        <Input
          id="shopNameKo"
          value={data.shopNameKo}
          onChange={(e) => updateField('shopNameKo', e.target.value)}
          placeholder={t('register.shopNameKoPlaceholder')}
          className={errors.shopNameKo ? 'border-destructive' : ''}
        />
        {errors.shopNameKo && <p className="text-sm text-destructive">{errors.shopNameKo}</p>}
      </div>

      <CategorySelect
        value={data.category}
        onChange={(v) => updateField('category', v)}
        error={errors.category}
      />

      <div className="space-y-2">
        <Label htmlFor="description">{t('register.shopDescription')}</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder={t('register.shopDescriptionPlaceholder')}
          rows={4}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>
    </div>
  )
}
