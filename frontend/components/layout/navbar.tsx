'use client'

import { useAccount, ConnectButton } from '@/lib/web3'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Radio, Grid, ClipboardList, Store, Menu, Users } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const { isConnected } = useAccount()
  const pathname = usePathname()

  const publicNavLinks = [
    { href: '/live', label: 'Live', icon: Radio },
    { href: '/products', label: 'Products', icon: Grid },
    { href: '/sellers', label: 'Sellers', icon: Users },
  ]

  const authNavLinks = [
    { href: '/orders', label: 'My Orders', icon: ClipboardList },
    { href: '/sell', label: 'Sell', icon: Store },
  ]

  const allNavLinks = [...publicNavLinks, ...(isConnected ? authNavLinks : [])]

  return (
    <nav className={cn('main-navbar border-b border-border bg-background', className)}>
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/ember-logo-text.png"
              alt="Ember"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center justify-center gap-1 flex-1">
          {allNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-ember'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wallet Connection */}
          <ConnectButton />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <div className="mb-4">
                  <Image
                    src="/ember-logo-text.png"
                    alt="Ember"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>
                {allNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'bg-ember/10 text-ember'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <p className="font-medium">{link.label}</p>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
