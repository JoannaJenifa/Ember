'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSellerOrders } from '@/hooks/use-orders';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { markShipped } from '@/lib/ember/order-transactions';
import { formatUsdcAmount } from '@/lib/aptos';
import { OrderStatus } from '@/lib/ember/order-queries';

const STATUS_CONFIG = {
  [OrderStatus.Paid]: { label: 'Paid', icon: Clock, color: 'bg-yellow-500' },
  [OrderStatus.Shipped]: { label: 'Shipped', icon: Truck, color: 'bg-blue-500' },
  [OrderStatus.Delivered]: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' },
  [OrderStatus.Disputed]: { label: 'Disputed', icon: AlertTriangle, color: 'bg-red-500' },
  [OrderStatus.Cancelled]: { label: 'Cancelled', icon: Package, color: 'bg-gray-500' },
  [OrderStatus.Refunded]: { label: 'Refunded', icon: Package, color: 'bg-gray-500' },
};

interface OrderManagementProps {
  sellerAddress: string;
}

export function OrderManagement({ sellerAddress }: OrderManagementProps) {
  const { orders, loading, refetch } = useSellerOrders(sellerAddress);
  const { isPrivy, publicKeyHex, signAndSubmitTransaction } = useWalletContext();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === parseInt(statusFilter);
  });

  const handleMarkShipped = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      await markShipped(sellerAddress, orderId, {
        isPrivy,
        publicKeyHex,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      });
      toast.success('Order marked as shipped!');
      refetch();
    } catch (err) {
      console.error('Failed to mark shipped:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Orders ({filteredOrders.length})
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="0">Paid</SelectItem>
            <SelectItem value="1">Shipped</SelectItem>
            <SelectItem value="2">Delivered</SelectItem>
            <SelectItem value="3">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No orders yet</h2>
          <p className="text-muted-foreground">Orders will appear here when customers purchase</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG[0];
            const StatusIcon = config.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="bg-card border-border overflow-hidden">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${config.color} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Order #{order.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-ember font-semibold">
                        ${formatUsdcAmount(order.totalPrice)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Product #{order.productId} · Qty: {order.quantity} · {formatDate(order.createdAt)}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Buyer:</span>
                        <p className="font-mono">{formatAddress(order.buyer)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Shipping Info:</span>
                        <p>{order.shippingInfo || 'Not provided'}</p>
                      </div>
                    </div>
                    {order.status === OrderStatus.Paid && (
                      <Button
                        className="bg-ember hover:bg-ember/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkShipped(order.id);
                        }}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Truck className="h-4 w-4 mr-2" />
                        )}
                        Mark as Shipped
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
