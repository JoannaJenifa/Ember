'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccount, ConnectButton } from '@/lib/web3'
import { User, Settings, ShoppingBag, Heart, LogOut } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function ProfilePage() {
  const { isConnected, address } = useAccount()
  const { t } = useTranslation()

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-card border-border p-8 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">{t('register.walletRequired')}</h1>
            <p className="text-muted-foreground mb-6">{t('register.walletRequiredDesc')}</p>
            <ConnectButton />
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">{t('profile.title')}</h1>
          <p className="text-muted-foreground">My Profile</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-card border-border p-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-coral" />
              </div>
              <p className="font-mono text-sm text-muted-foreground mb-4">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <Button variant="outline" className="gap-2 w-full">
                <Settings className="h-4 w-4" />
                {t('profile.accountSettings')}
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="bg-card border-border p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('profile.purchaseHistory')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-accent">
                <ShoppingBag className="h-6 w-6 text-coral mb-2" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">{t('nav.orders')}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent">
                <Heart className="h-6 w-6 text-coral mb-2" />
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">{t('profile.myWishlist')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
