'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Store, ShieldCheck, Package, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Placeholder for top sellers (would come from indexer)
const MOCK_TOP_SELLERS = [
  {
    address: '0x1234567890abcdef',
    shopName: 'Fashion Hub',
    totalSales: 1250000000000,
    totalOrders: 156,
    isVerified: true,
  },
  {
    address: '0xabcdef1234567890',
    shopName: 'Tech World',
    totalSales: 980000000000,
    totalOrders: 89,
    isVerified: true,
  },
  {
    address: '0x9876543210fedcba',
    shopName: 'Beauty Corner',
    totalSales: 750000000000,
    totalOrders: 234,
    isVerified: false,
  },
  {
    address: '0xfedcba0987654321',
    shopName: 'Sports Pro',
    totalSales: 620000000000,
    totalOrders: 178,
    isVerified: true,
  },
];

export function TopSellers() {
  const { t } = useTranslation();
  const sellers = MOCK_TOP_SELLERS;

  const formatSales = (sales: number) => {
    const move = sales / 1e8;
    if (move >= 1000) {
      return (move / 1000).toFixed(1) + 'K';
    }
    return move.toFixed(0);
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('home.topSellers')}</h2>
        <Link href="/sellers">
          <Button variant="ghost" className="text-ember hover:text-ember/80">
            {t('common.viewAll')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sellers.map((seller, index) => (
          <Link key={seller.address} href={`/seller/${seller.address}`}>
            <Card className="bg-card border-border p-4 hover:border-ember/50 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-ember/10 text-ember">
                      {getInitials(seller.shopName)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-ember rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-foreground truncate">{seller.shopName}</h3>
                    {seller.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatSales(seller.totalSales)} MOVE {t('seller.sales')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  <span>{seller.totalOrders} {t('seller.orders')}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
