'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px] 2xl:min-h-[800px] flex items-center">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <Flame className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">{t('hero.badge')}</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-primary">Ember</span>
            <br />
            <span className="text-white">
              {t('hero.title')}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
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
                variant="ghost"
                className="text-white hover:bg-white/10 px-8 h-12 text-lg"
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
