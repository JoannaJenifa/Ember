'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  Package,
  ShieldCheck,
  ExternalLink,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Smartphone,
  Sofa,
  Dumbbell,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const CATEGORIES = [
  { id: 'all', labelKey: 'common.all', icon: null },
  { id: 0, labelKey: 'categories.fashion', icon: Shirt },
  { id: 1, labelKey: 'categories.beauty', icon: Sparkles },
  { id: 2, labelKey: 'categories.food', icon: UtensilsCrossed },
  { id: 3, labelKey: 'categories.electronics', icon: Smartphone },
  { id: 4, labelKey: 'categories.home', icon: Sofa },
  { id: 5, labelKey: 'categories.sports', icon: Dumbbell },
];

// Placeholder sellers (would come from indexer in production)
const MOCK_SELLERS = [
  {
    addr: '0x1234567890abcdef1234567890abcdef12345678',
    shopName: 'Fashion Hub',
    description: 'Best fashion items at affordable prices',
    category: 0,
    totalSales: 1250000000000,
    totalOrders: 156,
    isVerified: true,
  },
  {
    addr: '0xabcdef1234567890abcdef1234567890abcdef12',
    shopName: 'Tech World',
    description: 'Latest gadgets and electronics',
    category: 3,
    totalSales: 980000000000,
    totalOrders: 89,
    isVerified: true,
  },
  {
    addr: '0x9876543210fedcba9876543210fedcba98765432',
    shopName: 'Beauty Corner',
    description: 'Premium beauty and skincare products',
    category: 1,
    totalSales: 750000000000,
    totalOrders: 234,
    isVerified: false,
  },
];

export default function SellersPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredSellers = useMemo(() => {
    return MOCK_SELLERS.filter((seller) => {
      if (category !== 'all' && seller.category !== category) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return seller.shopName.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [category, search]);

  const formatSales = (sales: number) => {
    const move = sales / 1e8;
    if (move >= 1000) return (move / 1000).toFixed(1) + 'K';
    return move.toFixed(0);
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('sellersPage.title')}</h1>
            <p className="text-muted-foreground">{t('sellersPage.subtitle')}</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('categories.search')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={cat.id === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.id)}
              className={cat.id === category ? 'bg-coral hover:bg-coral/90' : ''}
            >
              {t(cat.labelKey)}
            </Button>
          ))}
        </div>

        {filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <Link key={seller.addr} href={`/seller/${seller.addr}`}>
                <Card className="bg-card border-border overflow-hidden hover:border-coral/50 transition-colors cursor-pointer h-full">
                  <div className="h-24 bg-gradient-to-r from-coral/20 to-coral/10" />
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 -mt-10 border-4 border-card">
                        <AvatarFallback className="bg-coral/10 text-coral text-lg">
                          {getInitials(seller.shopName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {seller.shopName}
                          </h3>
                          {seller.isVerified && (
                            <Badge variant="secondary" className="text-xs shrink-0 gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              {t('common.verified')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            <span>{seller.totalOrders} {t('seller.orders')}</span>
                          </div>
                          <span>{formatSales(seller.totalSales)} MOVE</span>
                        </div>
                      </div>
                    </div>
                    {seller.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {seller.description}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-coral hover:text-coral/80 p-0 h-auto"
                    >
                      {t('sellersPage.viewShop')}
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('sellersPage.noSellers')}
            </h2>
            <p className="text-muted-foreground">{t('sellersPage.noSellersDesc')}</p>
          </Card>
        )}
      </div>
    </main>
  );
}
