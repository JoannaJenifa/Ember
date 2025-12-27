'use client'

import { ProfileUpload } from './profile-upload'
import { useTranslation } from '@/lib/i18n'

export interface ImagesData {
  profileImage: string | null
  bannerImage: string | null
}

interface RegistrationStepImagesProps {
  data: ImagesData
  onChange: (data: ImagesData) => void
  errors: Partial<Record<keyof ImagesData, string>>
}

export function RegistrationStepImages({ data, onChange, errors }: RegistrationStepImagesProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('register.images')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('seller.uploadImagesDesc')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ProfileUpload
          label={t('register.profileImage')}
          value={data.profileImage}
          onChange={(url) => onChange({ ...data, profileImage: url })}
          aspectRatio="square"
          error={errors.profileImage}
        />

        <div>
          <ProfileUpload
            label={t('register.bannerImage')}
            value={data.bannerImage}
            onChange={(url) => onChange({ ...data, bannerImage: url })}
            aspectRatio="banner"
            error={errors.bannerImage}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('seller.recommendedBannerSize')}
          </p>
        </div>
      </div>
    </div>
  )
}
