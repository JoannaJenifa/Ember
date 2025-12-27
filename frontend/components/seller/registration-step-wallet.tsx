'use client'

import { Card } from '@/components/ui/card'
import { Wallet, Check, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface RegistrationStepWalletProps {
  walletAddress: string | null
  isConnected: boolean
}

export function RegistrationStepWallet({ walletAddress, isConnected }: RegistrationStepWalletProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t('register.walletSetup')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('seller.walletNotice')}
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${isConnected ? 'bg-green-500/10' : 'bg-destructive/10'}`}
          >
            <Wallet className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-destructive'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{t('seller.wepinWallet')}</h4>
              {isConnected ? (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <Check className="h-3 w-3" />
                  {t('seller.connected')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {t('seller.connectionRequired')}
                </span>
              )}
            </div>
            {walletAddress ? (
              <p className="font-mono text-sm text-muted-foreground break-all">{walletAddress}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('register.walletRequiredDesc')}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">{t('seller.importantNotice')}</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t('seller.walletNotice1')}</li>
          <li>• {t('seller.walletNotice2')}</li>
          <li>• {t('seller.walletNotice3')}</li>
        </ul>
      </div>
    </div>
  )
}
