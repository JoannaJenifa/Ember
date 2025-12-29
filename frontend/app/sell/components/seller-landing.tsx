'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConnectButton } from '@/lib/web3'
import { Store, Zap, Globe, Percent } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface SellerLandingProps {
  isConnected: boolean
  address?: string
}

export function SellerLanding({ isConnected, address }: SellerLandingProps) {
  const { t } = useTranslation()

  const benefits = [
    {
      icon: Percent,
      titleKey: 'sell.lowFees.title',
      titleEnKey: 'sell.lowFees.titleEn',
      descKey: 'sell.lowFees.description',
    },
    {
      icon: Zap,
      titleKey: 'sell.instantSettlement.title',
      titleEnKey: 'sell.instantSettlement.titleEn',
      descKey: 'sell.instantSettlement.description',
    },
    {
      icon: Globe,
      titleKey: 'sell.globalReach.title',
      titleEnKey: 'sell.globalReach.titleEn',
      descKey: 'sell.globalReach.description',
    },
  ]

  const steps = [
    {
      step: '1',
      titleKey: 'sell.steps.connectWallet.title',
      titleEnKey: 'sell.steps.connectWallet.titleEn',
      descKey: 'sell.steps.connectWallet.desc'
    },
    {
      step: '2',
      titleKey: 'sell.steps.registerSeller.title',
      titleEnKey: 'sell.steps.registerSeller.titleEn',
      descKey: 'sell.steps.registerSeller.desc'
    },
    {
      step: '3',
      titleKey: 'sell.steps.addProducts.title',
      titleEnKey: 'sell.steps.addProducts.titleEn',
      descKey: 'sell.steps.addProducts.desc'
    },
    {
      step: '4',
      titleKey: 'sell.steps.goLive.title',
      titleEnKey: 'sell.steps.goLive.titleEn',
      descKey: 'sell.steps.goLive.desc'
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 text-coral mb-6">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">{t('sell.sellerCenter')}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('sell.startSellingOn')}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Start Selling on Labang</p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('sell.heroDesc')}
          </p>

          {isConnected ? (
            <Link href="/sell/register">
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-lg px-8">
                {t('sell.startRegistration')}
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">{t('sell.connectWalletToSell')}</p>
              <ConnectButton />
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            {t('sell.whyLabang')}
            <span className="block text-lg font-normal text-muted-foreground mt-1">
              Why Labang?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-card border-border">
                <div className="p-3 rounded-lg bg-coral/10 w-fit mb-4">
                  <benefit.icon className="h-6 w-6 text-coral" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t(benefit.titleKey)}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t(benefit.titleEnKey)}</p>
                <p className="text-muted-foreground text-sm">{t(benefit.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            {t('sell.howToStart')}
            <span className="block text-lg font-normal text-muted-foreground mt-1">
              How to Get Started
            </span>
          </h2>

          <div className="space-y-8">
            {steps.map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{t(item.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(item.titleEnKey)}</p>
                  <p className="text-muted-foreground mt-1">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {isConnected ? (
              <Link href="/sell/register">
                <Button size="lg" className="bg-coral hover:bg-coral/90">
                  {t('sell.startNow')}
                </Button>
              </Link>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
