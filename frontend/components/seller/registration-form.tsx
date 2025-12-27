'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { RegistrationStepper, REGISTRATION_STEPS } from './registration-stepper'
import { RegistrationStepBasic, BasicInfoData } from './registration-step-basic'
import { RegistrationStepImages, ImagesData } from './registration-step-images'
import { RegistrationStepWallet } from './registration-step-wallet'
import { RegistrationStepReview } from './registration-step-review'
import { useSellerRegistration } from '@/lib/hooks/use-seller'
import { useTranslation, type Locale } from '@/lib/i18n'
import { getDemoSeller } from '@/lib/demo/templates'

// Get random demo data for seller registration
function getRandomSellerData(locale: Locale): BasicInfoData {
  const template = getDemoSeller(locale)
  const templateOther = getDemoSeller(locale === 'en' ? 'ko' : 'en')
  return {
    shopName: locale === 'en' ? template.shopName : templateOther.shopName,
    shopNameKo: locale === 'ko' ? template.shopName : templateOther.shopName,
    category: template.category,
    description: template.description,
  }
}

interface RegistrationFormProps {
  walletAddress: string
}

export function RegistrationForm({ walletAddress }: RegistrationFormProps) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const { register, isLoading, isOnchainLoading, error: registrationError } = useSellerRegistration(walletAddress)
  const [currentStep, setCurrentStep] = useState(1)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Combined loading state
  const isPending = isLoading || isOnchainLoading

  // Random demo prefill data based on current language - editable by user
  const demoData = useMemo(() => getRandomSellerData(locale), [])
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>(demoData)

  const [images, setImages] = useState<ImagesData>({
    profileImage: null,
    bannerImage: null,
  })

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!basicInfo.shopName.trim()) {
        newErrors.shopName = t('register.shopNamePlaceholder')
      } else if (basicInfo.shopName.length < 2) {
        newErrors.shopName = t('errors.shopNameTooShort')
      }
      if (!basicInfo.category) {
        newErrors.category = t('register.selectCategory')
      }
    }

    if (step === 4) {
      if (!termsAccepted) {
        newErrors.terms = t('errors.termsRequired')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < REGISTRATION_STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setSubmitError(null)

    try {
      const result = await register({
        shopName: basicInfo.shopName,
        shopNameKo: basicInfo.shopNameKo || undefined,
        description: basicInfo.description || undefined,
        category: basicInfo.category,
        profileImage: images.profileImage || undefined,
        bannerImage: images.bannerImage || undefined,
      })

      if (result) {
        // Wait for subgraph to index the transaction (typically 2-5 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000))
        router.push('/sell')
      } else {
        setSubmitError(registrationError || t('errors.registrationFailed'))
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('errors.registrationFailed'))
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegistrationStepBasic data={basicInfo} onChange={setBasicInfo} errors={errors} />
      case 2:
        return <RegistrationStepImages data={images} onChange={setImages} errors={errors} />
      case 3:
        return <RegistrationStepWallet walletAddress={walletAddress} isConnected={!!walletAddress} />
      case 4:
        return (
          <RegistrationStepReview
            basicInfo={basicInfo}
            images={images}
            walletAddress={walletAddress}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 bg-card border-border">
        <div className="mb-8">
          <RegistrationStepper currentStep={currentStep} />
        </div>

        <div className="min-h-[400px]">{renderStep()}</div>

        {errors.terms && <p className="text-sm text-destructive mt-4">{errors.terms}</p>}
        {submitError && <p className="text-sm text-destructive mt-4">{submitError}</p>}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isPending}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('register.previous')}
          </Button>

          {currentStep < REGISTRATION_STEPS.length ? (
            <Button onClick={handleNext} disabled={isPending} className="bg-coral hover:bg-coral/90">
              {t('common.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending || !termsAccepted}
              className="bg-coral hover:bg-coral/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('register.registering')}
                </>
              ) : (
                t('register.submitRegistration')
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
