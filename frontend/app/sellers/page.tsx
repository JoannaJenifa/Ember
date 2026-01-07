'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  Star,
  Package,
  ExternalLink,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Smartphone,
  Sofa,
  Dumbbell,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'all', labelKey: 'common.all', icon: null },
  { id: 'fashion', labelKey: 'categories.fashion', icon: Shirt },
  { id: 'beauty', labelKey: 'categories.beauty', icon: Sparkles },
  { id: 'food', labelKey: 'categories.food', icon: UtensilsCrossed },
  { id: 'electronics', labelKey: 'categories.electronics', icon: Smartphone },
  { id: 'home', labelKey: 'categories.home', icon: Sofa },
  { id: 'sports', labelKey: 'categories.sports', icon: Dumbbell },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface Seller {
  id: string;
  wallet: string;
  shopName: string;
  category: string;
  isActive: boolean;
  totalOrders: number;
  totalSales: string;
  profileImage?: string;
  bannerImage?: string;
  shopNameKo?: string;
  description?: string;
}

export default function SellersPage() {
  const { t } = useTranslation();
  const [sellers] = useState<Seller[]>([]);
  const [loading] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [search, setSearch] = useState('');

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      if (category !== 'all' && seller.category !== category) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = seller.shopName.toLowerCase().includes(searchLower);
        const matchesNameKo = seller.shopNameKo?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesNameKo) return false;
      }
      return true;
    });
  }, [sellers, category, search]);

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-24 bg-muted" />
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted -mt-10 border-4 border-card" />
                    <div className="flex-1 space-y-2 pt-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <Link key={seller.id} href={`/seller/${seller.wallet}`}>
                <Card className="bg-card border-border overflow-hidden hover:border-coral/50 transition-colors cursor-pointer h-full">
                  <div className="h-24 bg-gradient-to-r from-coral/20 to-coral/10 relative">
                    {seller.bannerImage && (
                      <img
                        src={seller.bannerImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 -mt-10 border-4 border-card">
                        <AvatarImage src={seller.profileImage} alt={seller.shopName} />
                        <AvatarFallback className="bg-coral/10 text-coral text-lg">
                          {getInitials(seller.shopName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {seller.shopName}
                          </h3>
                          {seller.isActive && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {t('common.verified')}
                            </Badge>
                          )}
                        </div>
                        {seller.shopNameKo && (
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {seller.shopNameKo}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            <span>
                              {seller.totalOrders} {t('seller.orders')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            <span>{seller.totalSales}</span>
                          </div>
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
