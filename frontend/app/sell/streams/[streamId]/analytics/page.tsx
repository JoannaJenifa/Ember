'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Users,
  Clock,
  ShoppingBag,
  Coins,
  TrendingUp,
  BarChart3,
  Gift,
} from 'lucide-react'
import { useStream } from '@/lib/hooks/use-streams'
import { Skeleton } from '@/components/ui/skeleton'
import { format, formatDistanceStrict } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: React.ElementType
  iconColor?: string
}

function StatCard({ label, value, subtext, icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function StreamAnalyticsPage() {
  const { t, locale } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const streamId = params.streamId as string
  const { stream, loading } = useStream(streamId)
  const dateLocale = locale === 'ko' ? ko : enUS

  const getDuration = () => {
    if (!stream?.started_at || !stream?.ended_at) return '0' + t('analytics.period')
    return formatDistanceStrict(
      new Date(stream.started_at),
      new Date(stream.ended_at),
      { locale: dateLocale }
    )
  }

  const getConversionRate = () => {
    const viewers = stream?.peak_viewers || 0
    const orders = 0 // TODO: Get from orders
    if (viewers === 0) return '0%'
    return `${((orders / viewers) * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('stream.streamNotFound')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/sell/streams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('analytics.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {stream.title_ko || stream.title}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stream Info */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-wrap gap-4 text-sm">
            {stream.started_at && (
              <div>
                <span className="text-muted-foreground">{t('stream.startStream')}: </span>
                <span className="text-foreground">
                  {format(new Date(stream.started_at), locale === 'ko' ? 'yyyy년 M월 d일 HH:mm' : 'MMM d, yyyy HH:mm', { locale: dateLocale })}
                </span>
              </div>
            )}
            {stream.ended_at && (
              <div>
                <span className="text-muted-foreground">{t('stream.endStream')}: </span>
                <span className="text-foreground">
                  {format(new Date(stream.ended_at), locale === 'ko' ? 'yyyy년 M월 d일 HH:mm' : 'MMM d, yyyy HH:mm', { locale: dateLocale })}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Summary Stats */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('analytics.overview')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.period')}
              value={getDuration()}
              icon={Clock}
              iconColor="text-blue-500"
            />
            <StatCard
              label={t('analytics.viewerCount')}
              value={stream.peak_viewers?.toLocaleString() || 0}
              icon={Users}
              iconColor="text-green-500"
            />
            <StatCard
              label={t('live.viewers')}
              value={Math.floor((stream.peak_viewers || 0) * 0.7).toLocaleString()}
              subtext={t('analytics.period')}
              icon={TrendingUp}
              iconColor="text-purple-500"
            />
            <StatCard
              label={t('analytics.totalOrders')}
              value={0}
              icon={ShoppingBag}
              iconColor="text-orange-500"
            />
            <StatCard
              label={t('analytics.totalSales')}
              value="0 VERY"
              icon={Coins}
              iconColor="text-yellow-500"
            />
            <StatCard
              label={t('analytics.conversionRate')}
              value={getConversionRate()}
              subtext={t('order.quantity') + '/' + t('live.viewers')}
              icon={BarChart3}
              iconColor="text-cyan-500"
            />
            <StatCard
              label={t('gift.giftRevenue')}
              value="0 VERY"
              icon={Gift}
              iconColor="text-pink-500"
            />
            <StatCard
              label={t('analytics.topProducts')}
              value="-"
              icon={TrendingUp}
              iconColor="text-coral"
            />
          </div>
        </div>

        {/* Charts Placeholder */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('analytics.revenueChart')}</h2>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('analytics.noData')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('analytics.topProducts')}</h2>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-center h-[100px] text-muted-foreground">
              <p>{t('analytics.noData')}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
