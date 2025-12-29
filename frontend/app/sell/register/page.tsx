'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, ConnectButton } from '@/lib/web3'
import { useSeller } from '@/lib/hooks/use-seller'
import { RegistrationForm } from '@/components/seller/registration-form'
import { Card } from '@/components/ui/card'
import { Wallet } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

export default function SellerRegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { seller, isLoading, isSeller } = useSeller(address)

  // Redirect if already a seller
  useEffect(() => {
    if (isSeller && !isLoading) {
      router.push('/sell')
    }
  }, [isSeller, isLoading, router])

  // Loading state
  if (isConnected && isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card className="p-6">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-6">
        <Card className="max-w-md w-full p-8 text-center bg-card border-border">
          <div className="p-4 rounded-full bg-coral/10 w-fit mx-auto mb-4">
            <Wallet className="h-8 w-8 text-coral" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('register.walletRequired')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('register.walletRequiredDesc')}
          </p>
          <ConnectButton />
        </Card>
      </div>
    )
  }

  // Already a seller (should redirect)
  if (isSeller) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">{t('register.sellerRegistration')}</h1>
        </div>

        {/* Registration Form */}
        <RegistrationForm walletAddress={address!} />
      </div>
    </div>
  )
}
