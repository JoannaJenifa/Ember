'use client'

import { useEffect } from 'react'
import { type Address, formatUnits } from 'viem'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, DollarSign, Users, Loader2, ArrowDownToLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStreamerGiftRevenue, useWithdrawGiftRevenue } from '@/lib/web3/gifts'
import { useTipBalance, useWithdrawTips } from '@/lib/web3/tips'
import { useTranslation } from '@/lib/i18n'

interface GiftRevenueCardProps {
  streamerAddress?: Address
  className?: string
}

interface RevenueStatProps {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
  loading?: boolean
}

function RevenueStat({ icon, label, value, subValue, loading }: RevenueStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-coral/10">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-coral" />
        ) : (
          <>
            <p className="text-lg font-bold text-foreground">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
          </>
        )}
      </div>
    </div>
  )
}

export function GiftRevenueCard({ streamerAddress, className }: GiftRevenueCardProps) {
  const { t } = useTranslation()
  const {
    revenue: giftRevenue,
    revenueFormatted: giftRevenueFormatted,
    totalReceivedFormatted: totalGiftsFormatted,
    loading: loadingGifts,
    refetch: refetchGifts,
  } = useStreamerGiftRevenue(streamerAddress)

  const {
    balance: tipBalance,
    balanceFormatted: tipBalanceFormatted,
    totalReceivedFormatted: totalTipsFormatted,
    loading: loadingTips,
    refetch: refetchTips,
  } = useTipBalance(streamerAddress)

  const { withdraw: withdrawGifts, loading: withdrawingGifts } = useWithdrawGiftRevenue()
  const { withdrawTips, loading: withdrawingTips } = useWithdrawTips()

  const hasGiftPending = giftRevenue > 0n
  const hasTipPending = tipBalance > 0n
  const totalPending = parseFloat(giftRevenueFormatted) + parseFloat(tipBalanceFormatted)

  useEffect(() => {
    if (streamerAddress) {
      refetchGifts()
      refetchTips()
    }
  }, [streamerAddress, refetchGifts, refetchTips])

  const handleWithdrawAll = async () => {
    const promises = []
    if (hasGiftPending) promises.push(withdrawGifts())
    if (hasTipPending) promises.push(withdrawTips())
    await Promise.all(promises)
    refetchGifts()
    refetchTips()
  }

  if (!streamerAddress) {
    return (
      <Card className={cn('bg-card border-border p-6', className)}>
        <p className="text-muted-foreground text-center">
          {t('seller.connectWalletToViewRevenue')}
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-card border-border p-6 space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t('seller.giftTipRevenue')}</h3>
        {(hasGiftPending || hasTipPending) && (
          <Button
            size="sm"
            onClick={handleWithdrawAll}
            disabled={withdrawingGifts || withdrawingTips}
            className="bg-coral hover:bg-coral/90"
          >
            {withdrawingGifts || withdrawingTips ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4 mr-2" />
            )}
            {t('seller.withdraw')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RevenueStat
          icon={<Gift className="h-5 w-5 text-coral" />}
          label={t('seller.pendingGifts')}
          value={`${giftRevenueFormatted} VERY`}
          subValue={`${t('seller.total')} ${totalGiftsFormatted} VERY`}
          loading={loadingGifts}
        />
        <RevenueStat
          icon={<DollarSign className="h-5 w-5 text-coral" />}
          label={t('seller.pendingTips')}
          value={`${tipBalanceFormatted} VERY`}
          subValue={`${t('seller.total')} ${totalTipsFormatted} VERY`}
          loading={loadingTips}
        />
      </div>

      {totalPending > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('seller.totalWithdrawable')}</span>
            <span className="text-xl font-bold text-coral">{totalPending.toFixed(2)} VERY</span>
          </div>
        </div>
      )}
    </Card>
  )
}
