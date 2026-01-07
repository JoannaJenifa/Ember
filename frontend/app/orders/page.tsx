'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { useBuyerOrders } from '@/hooks/use-orders';
import { BuyerOrderCard } from './components/order-card';
import { DeliveryConfirmation } from './components/delivery-confirmation';
import { DisputeForm } from './components/dispute-form';
import { OrderStatus } from '@/lib/ember/order-queries';

export default function OrdersPage() {
  const { walletAddress, isConnected, login } = useWalletContext();
  const { orders, loading, refetch } = useBuyerOrders(walletAddress);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmingOrder, setConfirmingOrder] = useState<number | null>(null);
  const [disputingOrder, setDisputingOrder] = useState<number | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === parseInt(statusFilter);
  });

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center bg-card border-border">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">My Orders</h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your orders
            </p>
            <Button onClick={login} className="bg-ember hover:bg-ember/90">
              Connect Wallet
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your purchases</p>
          </div>
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
              <SelectItem value="4">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ember" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Button asChild className="bg-ember hover:bg-ember/90">
              <a href="/products">Browse Products</a>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <BuyerOrderCard
                key={order.id}
                order={order}
                onConfirmDelivery={() => setConfirmingOrder(order.id)}
                onDispute={() => setDisputingOrder(order.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Confirmation Dialog */}
      {confirmingOrder !== null && (
        <DeliveryConfirmation
          orderId={confirmingOrder}
          onClose={() => setConfirmingOrder(null)}
          onSuccess={() => {
            setConfirmingOrder(null);
            refetch();
          }}
        />
      )}

      {/* Dispute Form Dialog */}
      {disputingOrder !== null && (
        <DisputeForm
          orderId={disputingOrder}
          onClose={() => setDisputingOrder(null)}
          onSuccess={() => {
            setDisputingOrder(null);
            refetch();
          }}
        />
      )}
    </main>
  );
}
