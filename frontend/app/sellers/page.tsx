'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Users,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Smartphone,
  Sofa,
  Dumbbell,
  Store,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSellers } from '@/hooks/use-sellers';
import { formatUsdcAmount } from '@/lib/aptos';

const CATEGORIES = [
  { id: 'all', labelKey: 'common.all', icon: null },
  { id: 0, labelKey: 'categories.fashion', icon: Shirt },
  { id: 1, labelKey: 'categories.beauty', icon: Sparkles },
  { id: 2, labelKey: 'categories.food', icon: UtensilsCrossed },
  { id: 3, labelKey: 'categories.electronics', icon: Smartphone },
  { id: 4, labelKey: 'categories.home', icon: Sofa },
  { id: 5, labelKey: 'categories.sports', icon: Dumbbell },
];

export default function SellersPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const { sellers, isLoading } = useSellers();

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      const matchesCategory = category === 'all' || seller.category === category;
      const matchesSearch =
        !search ||
        seller.shopName.toLowerCase().includes(search.toLowerCase()) ||
        seller.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [sellers, category, search]);

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
              className={cat.id === category ? 'bg-ember hover:bg-ember/90' : ''}
            >
              {t(cat.labelKey)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <Card className="bg-card border-border p-12 text-center">
            <Loader2 className="h-8 w-8 text-ember mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading sellers...</p>
          </Card>
        ) : filteredSellers.length === 0 ? (
          <Card className="bg-card border-border p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('sellersPage.noSellers')}
            </h2>
            <p className="text-muted-foreground">{t('sellersPage.noSellersDesc')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSellers.map((seller) => (
              <Link key={seller.addr} href={`/seller/${seller.addr}`}>
                <Card className="bg-card border-border p-4 hover:border-ember/50 transition-colors cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    {seller.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seller.profileImage}
                        alt={seller.shopName}
                        className="h-16 w-16 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{seller.shopName}</h3>
                        {seller.status === 2 && (
                          <CheckCircle className="h-4 w-4 text-ember shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {seller.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {seller.totalOrders} orders
                        </span>
                        <span className="font-medium text-ember">
                          ${formatUsdcAmount(seller.totalSales)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
