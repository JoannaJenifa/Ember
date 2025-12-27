'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export interface Step {
  id: number
  key: string
}

const STEP_KEYS = ['basicInfo', 'images', 'walletSetup', 'reviewSubmit'] as const

export const REGISTRATION_STEPS: Step[] = STEP_KEYS.map((key, index) => ({
  id: index + 1,
  key,
}))

interface RegistrationStepperProps {
  currentStep: number
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {REGISTRATION_STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  currentStep > step.id
                    ? 'border-coral bg-coral text-white'
                    : currentStep === step.id
                      ? 'border-coral text-coral'
                      : 'border-border text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {t(`register.${step.key}`)}
                </p>
              </div>
            </div>
            {/* Connector line */}
            {index < REGISTRATION_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  currentStep > step.id ? 'bg-coral' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
