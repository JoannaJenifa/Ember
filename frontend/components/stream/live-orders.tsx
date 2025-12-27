'use client'

import { Card } from '@/components/ui/card'
import { ShoppingCart, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'

interface LiveOrder {
  id: string
  buyerAddress: string
  productName: string
  quantity: number
  totalVery: number
  createdAt: string
}

interface LiveOrdersProps {
  orders: LiveOrder[]
}

function maskAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function LiveOrders({ orders }: LiveOrdersProps) {
  const { t } = useTranslation()

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('order.myOrders')}</h3>

      {orders.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">{t('order.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-start gap-2 p-2 bg-muted/50 rounded-md animate-fade-in"
            >
              <ShoppingCart className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-medium">{maskAddress(order.buyerAddress)}</span>
                  {' - '}
                  <span>{order.productName}</span>
                  {' x '}
                  <span>{order.quantity}</span>
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-medium text-coral">
                    {order.totalVery.toLocaleString()} VERY
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
