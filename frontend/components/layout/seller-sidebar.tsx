'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Radio,
  BarChart3,
  Settings,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface SellerSidebarProps {
  className?: string
}

export function SellerSidebar({ className }: SellerSidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const sidebarLinks = [
    { href: '/sell', label: t('seller.dashboard'), icon: LayoutDashboard },
    { href: '/sell/products', label: t('seller.products'), icon: Package },
    { href: '/sell/streams', label: t('seller.streams'), icon: Radio },
    { href: '/sell/analytics', label: t('analytics.title'), icon: BarChart3 },
    { href: '/sell/profile', label: t('profile.title'), icon: Settings },
  ]

  return (
    <aside className={cn('w-64 border-r border-border bg-card h-[calc(100vh-64px)] sticky top-16', className)}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
              {t('common.backToHome')}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-coral/10 text-coral'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {t('seller.sellerCenter')}
          </p>
        </div>
      </div>
    </aside>
  )
}
