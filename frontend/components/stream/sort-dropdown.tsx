'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

export type SortOptionValue = 'viewers' | 'latest' | 'popular'

interface SortDropdownProps {
  selected: SortOptionValue
  onSelect: (sort: SortOptionValue) => void
  className?: string
}

export function SortDropdown({ selected, onSelect, className }: SortDropdownProps) {
  const { t } = useTranslation()

  const SORT_OPTIONS = [
    { id: 'viewers' as SortOptionValue, labelKey: 'sort.byViewers' },
    { id: 'latest' as SortOptionValue, labelKey: 'sort.latest' },
    { id: 'popular' as SortOptionValue, labelKey: 'sort.popular' },
  ]

  const selectedOption = SORT_OPTIONS.find((o) => o.id === selected) ?? SORT_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('min-w-[100px] justify-between', className)}>
          {t(selectedOption.labelKey)}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(selected === option.id && 'bg-accent')}
          >
            {t(option.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
