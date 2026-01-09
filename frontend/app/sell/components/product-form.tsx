'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { useProduct } from '@/hooks/use-products';
import { createProduct, updateProduct, updateInventory } from '@/lib/ember/product-transactions';

const CATEGORIES = [
  { value: 0, label: 'Fashion & Apparel' },
  { value: 1, label: 'Beauty & Cosmetics' },
  { value: 2, label: 'Food & Beverages' },
  { value: 3, label: 'Electronics' },
  { value: 4, label: 'Home & Living' },
  { value: 5, label: 'Sports & Fitness' },
  { value: 6, label: 'Other' },
];

interface ProductFormProps {
  sellerAddress: string;
  productId: number | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProductForm({ sellerAddress, productId, onCancel, onSuccess }: ProductFormProps) {
  const { isPrivy, publicKeyHex, signRawHash, signAndSubmitTransaction } = useWalletContext();
  const { product, loading: loadingProduct } = useProduct(productId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    inventory: '',
    category: '',
  });

  const isEditing = productId !== null;

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl,
        price: (product.price / 1e8).toString(),
        inventory: product.inventory.toString(),
        category: product.category.toString(),
      });
    }
  }, [product, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    const priceInOctas = Math.floor(parseFloat(formData.price) * 1e8);
    const inventory = parseInt(formData.inventory) || 0;

    setLoading(true);
    try {
      const context = {
        isPrivy,
        publicKeyHex,
        signRawHash: signRawHash || undefined,
        signAndSubmitTransaction: signAndSubmitTransaction || undefined,
      };

      if (isEditing && product) {
        // Update product details
        await updateProduct(
          sellerAddress,
          productId!,
          formData.title,
          formData.description,
          formData.imageUrl,
          priceInOctas,
          context
        );
        // Update inventory if changed
        if (inventory !== product.inventory) {
          await updateInventory(sellerAddress, productId!, inventory, context);
        }
        toast.success('Product updated successfully!');
      } else {
        await createProduct(
          sellerAddress,
          formData.title,
          formData.description,
          formData.imageUrl,
          priceInOctas,
          inventory,
          parseInt(formData.category),
          context
        );
        toast.success('Product created successfully!');
      }
      onSuccess();
    } catch (err) {
      console.error('Product operation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold text-foreground">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Product title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your product"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (MOVE) *</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory">Inventory *</Label>
            <Input
              id="inventory"
              type="number"
              min="0"
              placeholder="0"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value.toString()}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-ember hover:bg-ember/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
