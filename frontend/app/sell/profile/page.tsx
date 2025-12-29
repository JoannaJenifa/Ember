'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/lib/web3'
import { useSeller, useSellerRegistration } from '@/lib/hooks/use-seller'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProfileUpload } from '@/components/seller/profile-upload'
import { CategorySelect } from '@/components/seller/category-select'
import { VeryChatLink } from '@/components/seller/verychat-link'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { type VeryChatVerification } from '@/lib/utils/verychat-storage'

// Parse metadataURI JSON to get extended fields
function parseMetadata(metadataURI: string) {
  if (!metadataURI) return {}
  try {
    return JSON.parse(metadataURI)
  } catch {
    return {}
  }
}

export default function SellerProfilePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const { seller, isLoading: sellerLoading, refetch } = useSeller(address)
  const { update, isLoading: updating } = useSellerRegistration(address)

  // Parse metadata from metadataURI
  const metadata = useMemo(() => {
    return seller ? parseMetadata(seller.metadataURI) : {}
  }, [seller])

  const [shopName, setShopName] = useState('')
  const [shopNameKo, setShopNameKo] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [verychatHandle, setVerychatHandle] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize form with seller data
  if (seller && !initialized) {
    setShopName(seller.shopName)
    setShopNameKo(metadata.shopNameKo || '')
    setDescription(metadata.description || '')
    setCategory(seller.category)
    setProfileImage(metadata.profileImage || null)
    setBannerImage(metadata.bannerImage || null)
    setVerychatHandle(metadata.verychatHandle || null)
    setInitialized(true)
  }

  // Handle VeryChat verification change
  const handleVeryChatChange = (verification: VeryChatVerification | null) => {
    setVerychatHandle(verification?.handleId ?? null)
  }

  const handleSave = async () => {
    if (!seller) return

    const result = await update({
      shopName,
      shopNameKo: shopNameKo || undefined,
      description: description || undefined,
      category,
      profileImage: profileImage || undefined,
      bannerImage: bannerImage || undefined,
      verychatHandle: verychatHandle || undefined,
    })

    if (result) {
      await refetch()
    }
  }

  // Redirect if not a seller
  useEffect(() => {
    if (!sellerLoading && !seller) {
      router.push('/sell')
    }
  }, [sellerLoading, seller, router])

  // Loading state or not a seller
  if (sellerLoading || !seller) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
          <div className="max-w-2xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <Card className="p-6">
              <Skeleton className="h-40 w-40 rounded-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background p-6">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t('seller.profileSettings')}</h1>
              <p className="text-muted-foreground">Profile Settings</p>
            </div>
            <Link href={`/seller/${seller.id}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {t('seller.viewPublicProfile')}
              </Button>
            </Link>
          </div>

          {/* Profile Form */}
          <Card className="p-6 bg-card border-border space-y-6">
            {/* Images */}
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileUpload
                label={t('seller.profilePhoto')}
                value={profileImage}
                onChange={setProfileImage}
                aspectRatio="square"
              />
              <ProfileUpload
                label={t('seller.bannerImage')}
                value={bannerImage}
                onChange={setBannerImage}
                aspectRatio="banner"
              />
            </div>

            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName">{t('seller.shopName')}</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t('seller.enterShopName')}
              />
            </div>

            {/* Shop Name Korean */}
            <div className="space-y-2">
              <Label htmlFor="shopNameKo">{t('seller.shopNameKo')}</Label>
              <Input
                id="shopNameKo"
                value={shopNameKo}
                onChange={(e) => setShopNameKo(e.target.value)}
                placeholder={t('seller.enterShopNameKo')}
              />
            </div>

            {/* Category */}
            <CategorySelect value={category} onChange={setCategory} />

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('seller.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('seller.enterDescription')}
                rows={4}
              />
            </div>

            {/* VeryChat Verification */}
            {address && (
              <VeryChatLink
                walletAddress={address}
                onVerificationChange={handleVeryChatChange}
              />
            )}

            {/* Wallet (read-only) */}
            <div className="space-y-2">
              <Label>{t('seller.connectedWallet')}</Label>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                {seller.wallet}
              </div>
              <p className="text-xs text-muted-foreground">{t('seller.walletCannotChange')}</p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={updating}
              className="w-full bg-coral hover:bg-coral/90"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.saveChanges')}
                </>
              )}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
