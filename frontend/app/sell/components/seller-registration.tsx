'use client';

import { useState, useMemo } from 'react';
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
import { Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { registerSeller } from '@/lib/ember/seller-transactions';
import { getExplorerUrl } from '@/lib/aptos';
import { SingleImageUpload } from '@/components/ui/single-image-upload';
import { getDemoSeller } from '@/lib/demo/templates';

const CATEGORIES = [
  { value: 0, label: 'Fashion & Apparel' },
  { value: 1, label: 'Beauty & Cosmetics' },
  { value: 2, label: 'Food & Beverages' },
  { value: 3, label: 'Electronics' },
  { value: 4, label: 'Home & Living' },
  { value: 5, label: 'Sports & Fitness' },
  { value: 6, label: 'Other' },
];

interface SellerRegistrationProps {
  walletAddress: string;
}

export function SellerRegistration({ walletAddress }: SellerRegistrationProps) {
  const { isPrivy, publicKeyHex, signRawHash, signAndSubmitTransaction } = useWalletContext();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Random demo data for variation during demos
  const demoData = useMemo(() => getDemoSeller(), []);
  const categoryMap: Record<string, string> = { fashion: '0', beauty: '1', food: '2', electronics: '3', home: '4', other: '6' };

  const [formData, setFormData] = useState({
    shopName: demoData.shopName,
    description: demoData.description,
    profileImage: '',
    coverImage: '',
    category: categoryMap[demoData.category] || '1',
    youtubeChannel: `https://youtube.com/@${demoData.shopName.toLowerCase().replace(/\s+/g, '')}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const txHash = await registerSeller(
        walletAddress,
        formData.shopName,
        formData.description,
        formData.profileImage,
        formData.coverImage,
        parseInt(formData.category),
        formData.youtubeChannel,
        {
          isPrivy,
          publicKeyHex,
          signRawHash: signRawHash || undefined,
          signAndSubmitTransaction: signAndSubmitTransaction || undefined,
        }
      );
      toast.success('Registration submitted successfully!', {
        action: {
          label: 'View Tx',
          onClick: () => window.open(getExplorerUrl(txHash), '_blank'),
        },
        duration: 5000,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || uploading;

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-6 bg-card border-border">
        <div className="text-center mb-6">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-ember/20 flex items-center justify-center">
            <Store className="h-8 w-8 text-ember" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">
            Register your shop to start selling on Ember
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <SingleImageUpload
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              onUploadingChange={setUploading}
              aspectRatio="cover"
              placeholder="Upload cover image"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="w-24">
              <SingleImageUpload
                value={formData.profileImage}
                onChange={(url) => setFormData({ ...formData, profileImage: url })}
                onUploadingChange={setUploading}
                aspectRatio="square"
                placeholder="Profile"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name *</Label>
            <Input
              id="shopName"
              placeholder="Enter your shop name"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your shop and what you sell"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
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

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Channel URL</Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/@yourchannel"
              value={formData.youtubeChannel}
              onChange={(e) => setFormData({ ...formData, youtubeChannel: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-ember hover:bg-ember/90"
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'Register as Seller'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
