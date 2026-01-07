'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Package, Edit, Grid, List, Loader2 } from 'lucide-react';
import { useSellerProducts } from '@/hooks/use-seller';
import { formatMoveAmount } from '@/lib/aptos';
import { ProductForm } from './product-form';

interface ProductListProps {
  sellerAddress: string;
}

export function ProductList({ sellerAddress }: ProductListProps) {
  const { products, loading, refetch } = useSellerProducts(sellerAddress);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  const handleProductCreated = () => {
    setShowForm(false);
    setEditingProduct(null);
    refetch();
  };

  if (showForm || editingProduct !== null) {
    return (
      <ProductForm
        sellerAddress={sellerAddress}
        productId={editingProduct}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductCreated}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-ember hover:bg-ember/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-ember" />
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No products yet</h2>
          <p className="text-muted-foreground mb-4">Add your first product to start selling</p>
          <Button onClick={() => setShowForm(true)} className="bg-ember hover:bg-ember/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden bg-card border-border">
              <div className="aspect-square bg-muted relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {!product.isActive && (
                  <Badge className="absolute top-2 left-2 bg-gray-500">Inactive</Badge>
                )}
                {product.inventory < 10 && product.isActive && (
                  <Badge className="absolute top-2 right-2 bg-orange-500">Low Stock</Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-foreground text-sm line-clamp-1 mb-1">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ember font-semibold text-sm">
                    {formatMoveAmount(product.price)} MOVE
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {product.inventory}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setEditingProduct(product.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id} className="p-4 bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatMoveAmount(product.price)} MOVE · Stock: {product.inventory}
                  </p>
                </div>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setEditingProduct(product.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
