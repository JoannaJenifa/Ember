'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function TopSellers() {
  const { t } = useTranslation();
  // TODO: Fetch real sellers from on-chain data
  const sellers: Array<{
    address: string;
    shopName: string;
    totalSales: number;
    totalOrders: number;
    isVerified: boolean;
  }> = [];

  if (sellers.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('home.topSellers')}</h2>
          <Link href="/sellers">
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              {t('common.viewAll')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <Card className="bg-card border-border p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('sellersPage.noSellers')}</h3>
          <p className="text-muted-foreground">{t('sellersPage.noSellersDesc')}</p>
        </Card>
      </section>
    );
  }

  return null;
}
