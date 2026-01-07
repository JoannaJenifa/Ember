'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Video, Copy, ExternalLink, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerProducts } from '@/hooks/use-seller';
import { formatMoveAmount } from '@/lib/aptos';

interface GoLivePanelProps {
  sellerAddress: string;
}

export function GoLivePanel({ sellerAddress }: GoLivePanelProps) {
  const { products, loading } = useSellerProducts(sellerAddress);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isLive, setIsLive] = useState(false);

  const activeProducts = products.filter((p) => p.isActive && p.inventory > 0);

  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleStartLive = () => {
    if (!youtubeUrl) {
      toast.error('Please enter your YouTube stream URL');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to feature');
      return;
    }
    setIsLive(true);
    toast.success('You are now live!');
  };

  const handleStopLive = () => {
    setIsLive(false);
    toast.success('Stream ended');
  };

  const generateShareableLink = () => {
    // Generate a link to the live page with selected products
    const productIds = selectedProducts.join(',');
    return `${window.location.origin}/live/${sellerAddress}?products=${productIds}`;
  };

  const copyLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-ember/20 flex items-center justify-center">
            <Video className="h-5 w-5 text-ember" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Go Live</h2>
            <p className="text-sm text-muted-foreground">Set up your live stream</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Live Stream URL</Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLive}
            />
            <p className="text-xs text-muted-foreground">
              Paste your YouTube live stream URL
            </p>
          </div>

          {isLive ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-medium">LIVE</span>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Share Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={generateShareableLink()} readOnly className="text-xs" />
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="destructive" className="w-full" onClick={handleStopLive}>
                End Stream
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-ember hover:bg-ember/90"
              onClick={handleStartLive}
              disabled={!youtubeUrl || selectedProducts.length === 0}
            >
              <Video className="h-4 w-4 mr-2" />
              Start Live
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h2 className="font-semibold text-foreground mb-4">
          Featured Products ({selectedProducts.length} selected)
        </h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading products...</div>
        ) : activeProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No active products available</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-ember bg-ember/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => !isLive && toggleProduct(product.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isLive}
                    onCheckedChange={() => !isLive && toggleProduct(product.id)}
                  />
                  <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoveAmount(product.price)} MOVE · Stock: {product.inventory}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="h-5 w-5 text-ember flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
