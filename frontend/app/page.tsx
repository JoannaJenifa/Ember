'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, FileCode, Database } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { HeroSection } from './components/home/hero-section';
import { LiveNowSection } from './components/home/live-now-section';
import { FeaturedProducts } from './components/home/featured-products';
import { TopSellers } from './components/home/top-sellers';
import { HowItWorks } from './components/home/how-it-works';

const devFeatures = [
  { title: 'Basic Web3', icon: Wallet, href: '/basic-web3' },
  { title: 'Contracts', icon: FileCode, href: '/contracts' },
  { title: 'Indexer', icon: Database, href: '/indexer' },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <LiveNowSection />
      <FeaturedProducts />
      <TopSellers />
      <HowItWorks />

      {/* Dev Tools Section - Keep for testing */}
      <section className="container mx-auto px-4 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground mb-4 text-center">
            {t('common.devTools')}
          </p>
          <div className="flex justify-center gap-4">
            {devFeatures.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <feature.icon className="h-4 w-4" />
                  {feature.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
