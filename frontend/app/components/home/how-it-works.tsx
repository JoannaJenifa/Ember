'use client';

import { Card } from '@/components/ui/card';
import { Wallet, Radio, ShoppingCart, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const STEPS = [
  {
    icon: Wallet,
    titleKey: 'howItWorks.step1Title',
    descKey: 'howItWorks.step1Desc',
  },
  {
    icon: Radio,
    titleKey: 'howItWorks.step2Title',
    descKey: 'howItWorks.step2Desc',
  },
  {
    icon: ShoppingCart,
    titleKey: 'howItWorks.step3Title',
    descKey: 'howItWorks.step3Desc',
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('howItWorks.title')}</h2>
        <p className="text-muted-foreground">{t('howItWorks.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.titleKey} className="relative">
              <Card className="bg-card border-border p-6 text-center h-full">
                <div className="relative inline-flex">
                  <div className="h-16 w-16 rounded-full bg-coral/10 flex items-center justify-center mb-4 mx-auto">
                    <Icon className="h-8 w-8 text-coral" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-coral rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(step.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(step.descKey)}</p>
              </Card>
              {index < STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-coral" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
