'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Radio,
  Store,
  ShoppingBag,
  User,
  ArrowRight,
  Play,
  Wallet,
  FileCode,
  Database
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

const devFeatures = [
  { title: 'Basic Web3', icon: Wallet, href: '/basic-web3' },
  { title: 'Contracts', icon: FileCode, href: '/contracts' },
  { title: 'Indexer', icon: Database, href: '/indexer' },
]

export default function Home() {
  const { t } = useTranslation()

  const mainFeatures = [
    {
      icon: Radio,
      titleKey: 'features.liveShopping.title',
      descKey: 'features.liveShopping.description',
      href: '/live',
    },
    {
      icon: Store,
      titleKey: 'features.sell.title',
      descKey: 'features.sell.description',
      href: '/sell',
    },
    {
      icon: ShoppingBag,
      titleKey: 'features.orders.title',
      descKey: 'features.orders.description',
      href: '/orders',
    },
    {
      icon: User,
      titleKey: 'features.profile.title',
      descKey: 'features.profile.description',
      href: '/profile',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 border border-coral/20 mb-6">
            <Play className="h-4 w-4 text-coral" />
            <span className="text-sm text-coral">{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
            {t('hero.title')}
          </h1>

          <p className="text-xl md:text-2xl text-foreground mb-2">
            {t('hero.tagline')}
          </p>

          <p className="text-lg text-muted-foreground mb-8">
            {t('hero.taglineKo')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/live">
              <Button
                size="lg"
                className="bg-coral hover:bg-coral/90 text-coral-foreground px-8"
              >
                {t('hero.watchLive')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary"
              >
                {t('hero.startSelling')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mainFeatures.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="bg-card border-border p-6 hover:border-coral/50 transition-colors h-full cursor-pointer">
                <div className="p-3 rounded-lg bg-coral/10 inline-block mb-4">
                  <feature.icon className="h-6 w-6 text-coral" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(feature.descKey)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

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
  )
}
