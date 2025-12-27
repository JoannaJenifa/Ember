'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { formatEther } from 'viem'
import { CATEGORIES } from '@/lib/types/product'
import type { ProductWithSeller } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'

interface ProductTableProps {
  products: ProductWithSeller[]
  loading?: boolean
  onEdit?: (product: ProductWithSeller) => void
  onDelete?: (productId: string) => void
  onToggleStatus?: (product: ProductWithSeller) => void
}

export function ProductTable({ products, loading, onEdit, onDelete, onToggleStatus }: ProductTableProps) {
  const { t } = useTranslation()

  if (loading) {
    return <ProductTableSkeleton />
  }

  if (products.length === 0) {
    return null
  }

  const getCategoryLabel = (categoryId: string | null) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId)
    return cat ? cat.label : categoryId || '-'
  }

  const formatPrice = (priceWei: string | number) => {
    try {
      const ethValue = formatEther(BigInt(priceWei))
      return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 6 }).format(Number(ethValue))
    } catch {
      return '0'
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16">{t('product.images')}</TableHead>
            <TableHead>{t('product.productName')}</TableHead>
            <TableHead className="text-right">{t('product.price')}</TableHead>
            <TableHead className="text-right">{t('product.stock')}</TableHead>
            <TableHead>{t('product.category')}</TableHead>
            <TableHead>{t('order.status.pending')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isPending = product.id.startsWith('pending-')
            return (
            <TableRow key={product.id} className={`hover:bg-muted/30 ${isPending ? 'opacity-70' : ''}`}>
              <TableCell>
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">N/A</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-medium text-foreground">{product.title}</p>
                    {product.descriptionKo && (
                      <p className="text-sm text-muted-foreground">{product.descriptionKo}</p>
                    )}
                  </div>
                  {isPending && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Indexing
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-medium">{formatPrice(product.priceVery || '0')}</span>
                <span className="text-muted-foreground ml-1">VERY</span>
              </TableCell>
              <TableCell className="text-right">
                <span className={Number(product.inventory) === 0 ? 'text-destructive' : ''}>
                  {product.inventory ?? '0'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={product.isActive ? 'default' : 'outline'}>
                  {product.isActive ? t('product.inStock') : t('product.outOfStock')}
                </Badge>
              </TableCell>
              <TableCell>
                {isPending ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(product)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus?.(product)}>
                        {product.isActive ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            {t('product.outOfStock')}
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('product.inStock')}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </div>
  )
}

function ProductTableSkeleton() {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16">{t('product.images')}</TableHead>
            <TableHead>{t('product.productName')}</TableHead>
            <TableHead className="text-right">{t('product.price')}</TableHead>
            <TableHead className="text-right">{t('product.stock')}</TableHead>
            <TableHead>{t('product.category')}</TableHead>
            <TableHead>{t('order.status.pending')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="w-12 h-12 rounded-lg" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-14" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
