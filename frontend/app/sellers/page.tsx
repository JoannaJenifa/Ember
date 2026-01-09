'use client';

import { useState } from 'react';
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

export default function SellersPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  // TODO: Fetch real sellers from on-chain data
  const sellers: Array<{
    addr: string;
    shopName: string;
    description: string;
    category: number;
    totalSales: number;
    totalOrders: number;
    isVerified: boolean;
  }> = [];

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

        <Card className="bg-card border-border p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {t('sellersPage.noSellers')}
          </h2>
          <p className="text-muted-foreground">{t('sellersPage.noSellersDesc')}</p>
        </Card>
      </div>
    </main>
  );
}
