'use client'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getCategoryLabel, getCategoryIcon } from './seller-categories'
import type { BasicInfoData } from './registration-step-basic'
import type { ImagesData } from './registration-step-images'
import { useTranslation } from '@/lib/i18n'

interface RegistrationStepReviewProps {
  basicInfo: BasicInfoData
  images: ImagesData
  walletAddress: string
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

export function RegistrationStepReview({
  basicInfo,
  images,
  walletAddress,
  termsAccepted,
  onTermsChange,
}: RegistrationStepReviewProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('register.reviewSubmit')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('register.reviewInfo')}
        </p>
      </div>

      {/* Preview Card */}
      <Card className="overflow-hidden bg-card border-border">
        {images.bannerImage && (
          <div className="h-24 bg-muted">
            <img src={images.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {images.profileImage ? (
              <img
                src={images.profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                {getCategoryIcon(basicInfo.category)}
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg">{basicInfo.shopName}</h4>
              {basicInfo.shopNameKo && (
                <p className="text-muted-foreground">{basicInfo.shopNameKo}</p>
              )}
              <p className="text-sm text-coral mt-1">
                {getCategoryIcon(basicInfo.category)} {getCategoryLabel(basicInfo.category)}
              </p>
            </div>
          </div>
          {basicInfo.description && (
            <p className="mt-4 text-sm text-muted-foreground">{basicInfo.description}</p>
          )}
        </div>
      </Card>

      {/* Wallet info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm">
          <span className="text-muted-foreground">{t('wallet.address')}: </span>
          <span className="font-mono">{walletAddress}</span>
        </p>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          {t('seller.termsAgreement')}
        </Label>
      </div>
    </div>
  )
}
