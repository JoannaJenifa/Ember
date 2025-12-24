'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingBag, X, ChevronRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/ember/product-queries';

interface ProductOverlayProps {
  products: Product[];
  onBuy?: (product: Product, quantity: number) => void;
  className?: string;
}

export function ProductOverlay({ products, onBuy, className }: ProductOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const featuredProducts = products.slice(0, 3);
  const hasMore = products.length > 3;

  const formatPrice = (price: number) => {
    return (price / 1e6).toFixed(2);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleBuy = () => {
    if (selectedProduct && onBuy) {
      onBuy(selectedProduct, quantity);
      setSelectedProduct(null);
    }
  };

  if (products.length === 0) return null;

  return (
    <>
      {/* Floating product cards */}
      <div className={cn('absolute bottom-4 left-4 right-4 z-20', className)}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="shrink-0 w-40 p-2 bg-background/90 backdrop-blur cursor-pointer hover:bg-background transition-colors"
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-square rounded overflow-hidden mb-2">
                <img
                  src={product.imageUrl || '/placeholder-product.png'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium truncate">{product.title}</p>
              <p className="text-xs text-ember font-bold">${formatPrice(product.price)}</p>
            </Card>
          ))}
          {hasMore && (
            <Card
              className="shrink-0 w-40 p-2 bg-background/90 backdrop-blur cursor-pointer hover:bg-background transition-colors flex items-center justify-center"
              onClick={() => setExpanded(true)}
            >
              <div className="text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">+{products.length - 3} more</p>
                <ChevronRight className="h-4 w-4 mx-auto" />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* All products dialog */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Products ({products.length})
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="p-2 cursor-pointer hover:border-ember transition-colors"
                onClick={() => {
                  handleProductClick(product);
                  setExpanded(false);
                }}
              >
                <div className="aspect-square rounded overflow-hidden mb-2">
                  <img
                    src={product.imageUrl || '/placeholder-product.png'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium truncate">{product.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-ember font-bold">${formatPrice(product.price)}</p>
                  {product.inventory < 10 && (
                    <Badge variant="outline" className="text-xs">Low stock</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-sm">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Quick Buy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded overflow-hidden shrink-0">
                    <img
                      src={selectedProduct.imageUrl || '/placeholder-product.png'}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{selectedProduct.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedProduct.description}
                    </p>
                    <p className="text-lg text-ember font-bold mt-1">
                      ${formatPrice(selectedProduct.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.min(selectedProduct.inventory, quantity + 1))}
                      disabled={quantity >= selectedProduct.inventory}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock available</span>
                  <span>{selectedProduct.inventory}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-ember">
                      ${formatPrice(selectedProduct.price * quantity)}
                    </span>
                  </div>
                  <Button className="w-full" onClick={handleBuy}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
