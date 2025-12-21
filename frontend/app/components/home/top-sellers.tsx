'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Store, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSellers } from '@/hooks/use-sellers';
import { formatUsdcAmount } from '@/lib/aptos';

export function TopSellers() {
  const { t } = useTranslation();
  const { sellers, isLoading } = useSellers();

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

      {isLoading ? (
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-8 w-8 text-ember mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading sellers...</p>
        </Card>
      ) : sellers.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('sellersPage.noSellers')}</h3>
          <p className="text-muted-foreground">{t('sellersPage.noSellersDesc')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sellers.slice(0, 4).map((seller) => (
            <Link key={seller.addr} href={`/sellers/${seller.addr}`}>
              <Card className="bg-card border-border p-4 hover:border-ember/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  {seller.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seller.profileImage}
                      alt={seller.shopName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-foreground truncate">{seller.shopName}</p>
                      {seller.status === 2 && (
                        <CheckCircle className="h-4 w-4 text-ember shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{seller.totalOrders} orders</p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Sales: </span>
                  <span className="font-semibold text-ember">${formatUsdcAmount(seller.totalSales)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
