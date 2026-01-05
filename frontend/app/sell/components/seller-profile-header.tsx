'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Seller } from '@/lib/ember/queries';
import { Edit, Star, Package, ShoppingCart } from 'lucide-react';
import { ProfileEditDialog } from './profile-edit-dialog';

interface SellerProfileHeaderProps {
  seller: Seller;
  onProfileUpdate: () => void;
}

const CATEGORY_LABELS: Record<number, string> = {
  0: 'Fashion & Apparel',
  1: 'Beauty & Cosmetics',
  2: 'Food & Beverages',
  3: 'Electronics',
  4: 'Home & Living',
  5: 'Sports & Fitness',
  6: 'Other',
};

export function SellerProfileHeader({ seller, onProfileUpdate }: SellerProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);

  const averageRating = seller.ratingCount > 0
    ? (seller.ratingSum / seller.ratingCount).toFixed(1)
    : '0.0';

  const defaultCover = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop';
  const defaultProfile = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face';

  return (
    <>
      <div className="relative mb-8">
        {/* Cover Image */}
        <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seller.coverImage || defaultCover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Section */}
        <div className="relative px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
            {/* Profile Picture */}
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-xl border-4 border-background overflow-hidden bg-muted shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seller.profileImage || defaultProfile}
                alt={seller.shopName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {seller.shopName}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {CATEGORY_LABELS[seller.category] || 'General'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                  className="w-fit"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Description & Stats */}
          <div className="mt-4 space-y-4">
            {seller.description && (
              <p className="text-muted-foreground max-w-2xl">
                {seller.description}
              </p>
            )}

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">{averageRating}</span>
                <span className="text-muted-foreground">
                  ({seller.ratingCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-ember" />
                <span className="font-medium">{seller.totalOrders}</span>
                <span className="text-muted-foreground">orders</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-ember" />
                <span className="font-medium">
                  {(seller.totalSales / 1e8).toFixed(2)} MOVE
                </span>
                <span className="text-muted-foreground">total sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileEditDialog
        seller={seller}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          setEditOpen(false);
          onProfileUpdate();
        }}
      />
    </>
  );
}
