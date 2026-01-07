'use client';

import { Button } from '@/components/ui/button';
import {
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Smartphone,
  Sofa,
  Dumbbell,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Category IDs match the Move contract enum
export const CATEGORY_IDS = {
  ALL: null,
  FASHION: 0,
  BEAUTY: 1,
  FOOD: 2,
  ELECTRONICS: 3,
  HOME: 4,
  SPORTS: 5,
} as const;

const CATEGORIES = [
  { id: null, labelKey: 'common.all', icon: null },
  { id: 0, labelKey: 'categories.fashion', icon: Shirt },
  { id: 1, labelKey: 'categories.beauty', icon: Sparkles },
  { id: 2, labelKey: 'categories.food', icon: UtensilsCrossed },
  { id: 3, labelKey: 'categories.electronics', icon: Smartphone },
  { id: 4, labelKey: 'categories.home', icon: Sofa },
  { id: 5, labelKey: 'categories.sports', icon: Dumbbell },
];

interface CategoryTabsProps {
  selectedCategory: number | null;
  onCategoryChange: (category: number | null) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
      {CATEGORIES.map((cat) => {
        const isSelected = cat.id === selectedCategory;
        const Icon = cat.icon;

        return (
          <Button
            key={cat.id ?? 'all'}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(cat.id)}
            className={isSelected ? 'bg-coral hover:bg-coral/90' : ''}
          >
            {Icon && <Icon className="h-4 w-4 mr-1" />}
            {t(cat.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}

export function getCategoryLabel(categoryId: number): string {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat?.labelKey ?? 'categories.other';
}
