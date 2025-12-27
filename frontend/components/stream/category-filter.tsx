'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryId } from '@/lib/types/product'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface CategoryFilterProps {
  selected: CategoryId | 'all'
  onSelect: (category: CategoryId | 'all') => void
  className?: string
}

export function CategoryFilter({ selected, onSelect, className }: CategoryFilterProps) {
  const { t } = useTranslation()

  const categories = [
    { id: 'all' as const, labelKey: 'categories.all' },
    { id: 'fashion' as CategoryId, labelKey: 'categories.fashion' },
    { id: 'beauty' as CategoryId, labelKey: 'categories.beauty' },
    { id: 'food' as CategoryId, labelKey: 'categories.food' },
    { id: 'home' as CategoryId, labelKey: 'categories.home' },
    { id: 'tech' as CategoryId, labelKey: 'categories.tech' },
  ]

  const selectedCategory = categories.find((c) => c.id === selected) ?? categories[0]

  return (
    <>
      {/* Mobile: Horizontal scrollable pills */}
      <div className={cn('flex gap-2 overflow-x-auto pb-2 md:hidden scrollbar-hide', className)}>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selected === category.id ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0"
            onClick={() => onSelect(category.id)}
          >
            {t(category.labelKey)}
          </Button>
        ))}
      </div>

      {/* Desktop: Dropdown */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-between">
              {t(selectedCategory.labelKey)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={cn(selected === category.id && 'bg-accent')}
              >
                {t(category.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
