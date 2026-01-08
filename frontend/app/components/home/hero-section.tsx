'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Flame } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient - bold ember to amber */}
      <div className="absolute inset-0 bg-gradient-to-br from-ember/30 via-amber/20 to-gold/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber/20 via-ember/10 to-transparent" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ember/10 border border-ember/20 mb-6">
            <Flame className="h-4 w-4 text-ember animate-pulse" />
            <span className="text-sm text-ember font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-ember via-amber to-gold bg-clip-text text-transparent">Ember</span>
            <br />
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
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
                className="bg-gradient-to-r from-ember to-amber hover:from-ember/90 hover:to-amber/90 text-white px-8 h-12 text-lg shadow-lg shadow-ember/25"
              >
                {t('hero.startShopping')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="lg"
                variant="outline"
                className="border-ember text-ember hover:bg-ember/10 px-8 h-12 text-lg"
              >
                {t('hero.becomeSeller')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-ember/20 to-transparent border border-ember/20">
              <p className="text-3xl font-bold bg-gradient-to-r from-ember to-amber bg-clip-text text-transparent">3%</p>
              <p className="text-sm text-muted-foreground">{t('hero.platformFee')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber/20 to-transparent border border-amber/20">
              <p className="text-3xl font-bold bg-gradient-to-r from-amber to-gold bg-clip-text text-transparent">Instant</p>
              <p className="text-sm text-muted-foreground">{t('hero.settlement')}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gold/20 to-transparent border border-gold/20">
              <p className="text-3xl font-bold bg-gradient-to-r from-gold to-ember bg-clip-text text-transparent">Verified</p>
              <p className="text-sm text-muted-foreground">{t('hero.reviews')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
