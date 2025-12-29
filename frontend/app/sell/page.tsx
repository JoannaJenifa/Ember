'use client'

import { useEffect } from 'react'
import { useAccount } from '@/lib/web3'
import { useSeller } from '@/lib/hooks/use-seller'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { SellerDashboard } from './components/seller-dashboard'
import { SellerLanding } from './components/seller-landing'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function SellPage() {
  const { t } = useTranslation()
  const { address, isConnected } = useAccount()
  const { seller, isLoading, isSeller, refetch } = useSeller(address)

  // Poll for seller data if registered on-chain but not in subgraph yet
  useEffect(() => {
    if (isSeller && !seller && !isLoading) {
      const interval = setInterval(() => {
        refetch()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isSeller, seller, isLoading, refetch])

  // Loading state
  if (isConnected && isLoading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Not connected or not a seller - show landing
  if (!isConnected || !isSeller) {
    return <SellerLanding isConnected={isConnected} address={address} />
  }

  // Registered on-chain but subgraph not synced yet
  if (!seller) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <Card className="max-w-md mx-auto mt-20 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-coral mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t('seller.syncingData')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('seller.syncingDataDesc')}
            </p>
          </Card>
        </main>
      </div>
    )
  }

  // Registered seller - show dashboard
  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background">
        <SellerDashboard seller={seller} />
      </main>
    </div>
  )
}
