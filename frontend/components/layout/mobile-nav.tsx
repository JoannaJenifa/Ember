'use client'

import { useAccount } from '@/lib/web3'
import { ShoppingBag, Radio, Grid, ClipboardList, Store, Home, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const { isConnected } = useAccount()
  const pathname = usePathname()
  const { t } = useTranslation()

  const publicLinks = [
    { href: '/', labelKey: 'nav.home', icon: Home },
    { href: '/live', labelKey: 'nav.live', icon: Radio },
    { href: '/products', labelKey: 'nav.products', icon: Grid },
    { href: '/sellers', labelKey: 'nav.sellers', icon: Users },
  ]

  const authLinks = [
    { href: '/orders', labelKey: 'nav.orders', icon: ClipboardList },
    { href: '/sell', labelKey: 'nav.sell', icon: Store },
  ]

  const links = [...publicLinks, ...(isConnected ? authLinks : [])]

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background z-50', className)}>
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive = pathname === link.href ||
            (link.href !== '/' && pathname.startsWith(link.href + '/'))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                isActive ? 'text-coral' : 'text-muted-foreground'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t(link.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
