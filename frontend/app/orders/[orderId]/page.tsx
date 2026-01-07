'use client';

import { use, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useOrder } from '@/hooks/use-orders';
import { useProduct } from '@/hooks/use-products';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { formatMoveAmount, getAccountExplorerUrl } from '@/lib/aptos';
import { OrderStatus } from '@/lib/ember/order-queries';
import { DeliveryConfirmation } from '../components/delivery-confirmation';
import { DisputeForm } from '../components/dispute-form';

const STATUS_CONFIG = {
  [OrderStatus.Paid]: { label: 'Paid', icon: Clock, color: 'bg-yellow-500' },
  [OrderStatus.Shipped]: { label: 'Shipped', icon: Truck, color: 'bg-blue-500' },
  [OrderStatus.Delivered]: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' },
  [OrderStatus.Disputed]: { label: 'Disputed', icon: AlertTriangle, color: 'bg-red-500' },
  [OrderStatus.Cancelled]: { label: 'Cancelled', icon: Package, color: 'bg-gray-500' },
  [OrderStatus.Refunded]: { label: 'Refunded', icon: Package, color: 'bg-gray-500' },
};

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = use(params);
  const orderIdNum = parseInt(orderId);
  const { order, loading, refetch } = useOrder(orderIdNum);
  const { product } = useProduct(order?.productId ?? null);
  const { walletAddress } = useWalletContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDispute, setShowDispute] = useState(false);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center bg-card border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">This order doesn't exist</p>
            <Button asChild variant="outline">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const config = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG[OrderStatus.Paid];
  const StatusIcon = config.icon;
  const isBuyer = walletAddress?.toLowerCase() === order.buyer.toLowerCase();
  const canConfirm = isBuyer && order.status === OrderStatus.Shipped;
  const canDispute = isBuyer && (order.status === OrderStatus.Paid || order.status === OrderStatus.Shipped);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/orders"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>

        <Card className="bg-card border-border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Order #{order.id}</h1>
              <Badge className={`${config.color} gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            {/* Product Info */}
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="h-20 w-20 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                {product?.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {product?.title || `Product #${order.productId}`}
                </h3>
                <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                <p className="text-coral font-bold mt-1">
                  {formatMoveAmount(order.totalPrice)} MOVE
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Details */}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller</span>
                <a
                  href={getAccountExplorerUrl(order.seller)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-mono hover:text-coral flex items-center gap-1"
                >
                  {formatAddress(order.seller)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="text-foreground">{formatMoveAmount(order.platformFee)} MOVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller Amount</span>
                <span className="text-foreground">{formatMoveAmount(order.sellerAmount)} MOVE</span>
              </div>
              {order.shippingInfo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Info</span>
                  <span className="text-foreground">{order.shippingInfo}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Timeline */}
            <h3 className="font-semibold text-foreground mb-4">Order Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">{formatDate(order.createdAt)}</span>
              </div>
              {order.shippedAt > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Shipped:</span>
                  <span className="text-foreground">{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Delivered:</span>
                  <span className="text-foreground">{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {(canConfirm || canDispute) && (
              <>
                <Separator className="my-6" />
                <div className="flex gap-3">
                  {canConfirm && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowConfirm(true)}
                    >
                      Confirm Delivery
                    </Button>
                  )}
                  {canDispute && (
                    <Button variant="outline" className="flex-1" onClick={() => setShowDispute(true)}>
                      Dispute Order
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {showConfirm && (
        <DeliveryConfirmation
          orderId={order.id}
          onClose={() => setShowConfirm(false)}
          onSuccess={() => {
            setShowConfirm(false);
            refetch();
          }}
        />
      )}

      {showDispute && (
        <DisputeForm
          orderId={order.id}
          onClose={() => setShowDispute(false)}
          onSuccess={() => {
            setShowDispute(false);
            refetch();
          }}
        />
      )}
    </main>
  );
}
