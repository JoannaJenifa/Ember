'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/lib/ember/order-queries';
import { formatMoveAmount } from '@/lib/aptos';

const STATUS_CONFIG = {
  [OrderStatus.Paid]: { label: 'Paid', icon: Clock, color: 'bg-yellow-500 text-yellow-50' },
  [OrderStatus.Shipped]: { label: 'Shipped', icon: Truck, color: 'bg-blue-500 text-blue-50' },
  [OrderStatus.Delivered]: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500 text-green-50' },
  [OrderStatus.Disputed]: { label: 'Disputed', icon: AlertTriangle, color: 'bg-red-500 text-red-50' },
  [OrderStatus.Cancelled]: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-500 text-gray-50' },
  [OrderStatus.Refunded]: { label: 'Refunded', icon: Package, color: 'bg-gray-500 text-gray-50' },
};

interface BuyerOrderCardProps {
  order: Order;
  onConfirmDelivery?: () => void;
  onDispute?: () => void;
}

export function BuyerOrderCard({ order, onConfirmDelivery, onDispute }: BuyerOrderCardProps) {
  const config = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG[OrderStatus.Paid];
  const StatusIcon = config.icon;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const canConfirmDelivery = order.status === OrderStatus.Shipped;
  const canDispute = order.status === OrderStatus.Paid || order.status === OrderStatus.Shipped;
  const canReview = order.status === OrderStatus.Delivered;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <Link href={`/orders/${order.id}`}>
        <div className="p-4 hover:bg-card/80 transition-colors">
          <div className="flex items-start gap-4">
            {/* Product placeholder */}
            <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Order info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-medium text-foreground">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">Product #{order.productId}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                Qty: {order.quantity} · {formatDate(order.createdAt)}
              </p>

              <div className="flex items-center justify-between">
                <Badge className={`gap-1 ${config.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
                <span className="text-coral font-bold">
                  {formatMoveAmount(order.totalPrice)} MOVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      {(canConfirmDelivery || canDispute || canReview) && (
        <div className="flex gap-2 px-4 pb-4 pt-0">
          {canConfirmDelivery && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelivery?.();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Confirm Delivery
            </Button>
          )}
          {canReview && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/orders/${order.id}?review=true`}>Leave Review</Link>
            </Button>
          )}
          {canDispute && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                onDispute?.();
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Dispute
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
