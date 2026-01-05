'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Seller } from '@/lib/ember/queries';
import { updateProfile } from '@/lib/ember/seller-transactions';
import { useWalletContext } from '@/hooks/use-wallet-context';
import { SingleImageUpload } from '@/components/ui/single-image-upload';
import { getExplorerUrl } from '@/lib/aptos';

interface ProfileEditDialogProps {
  seller: Seller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProfileEditDialog({
  seller,
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditDialogProps) {
  const { walletAddress, isPrivy, publicKeyHex, signRawHash, signAndSubmitTransaction } =
    useWalletContext();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    profileImage: '',
    coverImage: '',
    youtubeChannel: '',
  });

  useEffect(() => {
    if (seller && open) {
      setFormData({
        shopName: seller.shopName,
        description: seller.description,
        profileImage: seller.profileImage || '',
        coverImage: seller.coverImage || '',
        youtubeChannel: seller.youtubeChannel || '',
      });
    }
  }, [seller, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !formData.shopName) {
      toast.error('Shop name is required');
      return;
    }

    setLoading(true);
    try {
      const txHash = await updateProfile(
        walletAddress,
        formData.shopName,
        formData.description,
        formData.profileImage,
        formData.coverImage,
        formData.youtubeChannel,
        {
          isPrivy,
          publicKeyHex,
          signRawHash: signRawHash || undefined,
          signAndSubmitTransaction: signAndSubmitTransaction || undefined,
        }
      );
      toast.success('Profile updated successfully!', {
        action: {
          label: 'View Tx',
          onClick: () => window.open(getExplorerUrl(txHash), '_blank'),
        },
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

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
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Channel URL</Label>
            <Input
              id="youtube"
              value={formData.youtubeChannel}
              onChange={(e) => setFormData({ ...formData, youtubeChannel: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitDisabled}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-ember hover:bg-ember/90"
              disabled={isSubmitDisabled}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
