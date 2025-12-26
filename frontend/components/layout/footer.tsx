'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Footer() {
  const { t } = useTranslation()

  const footerLinks = [
    { href: '/terms', labelKey: 'footer.terms' },
    { href: '/privacy', labelKey: 'footer.privacy' },
    { href: '/support', labelKey: 'footer.support' },
  ]

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-coral/10">
                <ShoppingBag className="h-4 w-4 text-coral" />
              </div>
              <span className="font-bold text-foreground">{t('common.appName')}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
