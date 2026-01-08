'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Flame className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-primary">Ember</span>
            <br />
            <span className="text-foreground">
              {t('hero.title')}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('hero.tagline')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-lg"
              >
                {t('hero.startShopping')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8 h-12 text-lg"
              >
                {t('hero.becomeSeller')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
