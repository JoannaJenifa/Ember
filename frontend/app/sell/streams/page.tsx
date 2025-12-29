'use client'

import { useState } from 'react'
import { SellerSidebar } from '@/components/layout/seller-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Radio, Plus, Calendar, Loader2 } from 'lucide-react'
import { useStreams } from '@/lib/hooks/use-streams'
import { useSeller } from '@/lib/hooks/use-seller'
import { useAccount } from '@/lib/web3/providers'
import { SellerStreamCard } from '@/components/stream/seller-stream-card'
import { CreateStreamModal } from '@/components/stream/create-stream-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'

export default function StreamsPage() {
  const { address } = useAccount()
  const { seller } = useSeller(address)
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled' | 'ended'>('live')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { streams, loading, refetch, deleteStream } = useStreams({
    walletAddress: address,
    status: activeTab,
  })

  const handleDelete = async (streamId: string) => {
    if (confirm(t('stream.confirmDelete'))) {
      await deleteStream(streamId)
    }
  }

  const renderEmptyState = () => {
    const messages = {
      scheduled: {
        title: t('stream.noScheduled'),
        subtitle: t('stream.scheduleNew'),
      },
      live: {
        title: t('stream.noLive'),
        subtitle: t('stream.startFromScheduled'),
      },
      ended: {
        title: t('stream.noEnded'),
        subtitle: t('stream.startFirstLive'),
      },
    }

    const { title, subtitle } = messages[activeTab]

    return (
      <Card className="bg-card border-border p-12 text-center">
        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{subtitle}</p>
        {activeTab === 'scheduled' && (
          <Button
            className="gap-2 bg-coral hover:bg-coral/90"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            {t('stream.scheduleStream')}
          </Button>
        )}
      </Card>
    )
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 min-h-[calc(100vh-64px)] bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{t('stream.management')}</h1>
              <p className="text-muted-foreground">Stream Management</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Calendar className="h-4 w-4" />
                {t('stream.scheduleStream')}
              </Button>
              <Button
                className="gap-2 bg-coral hover:bg-coral/90"
                onClick={() => setShowCreateModal(true)}
              >
                <Radio className="h-4 w-4" />
                {t('stream.goLiveNow')}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="live">{t('stream.live')}</TabsTrigger>
              <TabsTrigger value="scheduled">{t('stream.scheduled')}</TabsTrigger>
              <TabsTrigger value="ended">{t('stream.ended')}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-video" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : streams.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {streams.map((stream) => (
                    <SellerStreamCard
                      key={stream.id}
                      stream={stream}
                      onDelete={() => handleDelete(stream.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {address && (
        <CreateStreamModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          walletAddress={address}
          shopName={seller?.shopName}
          category={seller?.category}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}
