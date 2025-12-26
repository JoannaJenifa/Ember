/**
 * Connect Button - Reown/Wagmi Implementation
 */

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Wallet, Copy, ExternalLink, LogOut, Loader2 } from 'lucide-react'
import { useAccount } from './account'
import { useConnect, useDisconnect } from './connection'
import { useBalance } from './balance'
import { useTranslation } from '@/lib/i18n'

interface ConnectButtonProps {
  className?: string
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const { t } = useTranslation()
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  const { formatted, symbol, isLoading: isBalanceLoading } = useBalance()

  const [copied, setCopied] = useState(false)

  // Generate DiceBear pixel-art avatar URL using address as seed
  const avatarUrl = useMemo(() => {
    if (!address) return null
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`
  }, [address])

  // Not connected - show connect button
  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => connect()}
        disabled={isConnecting}
        className={`gap-2 ${className || ''}`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('wallet.connecting')}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            {t('wallet.connect')}
          </>
        )}
      </Button>
    )
  }

  // Connected - show wallet details dropdown
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = () => {
    if (chain?.blockExplorers?.default?.url) {
      window.open(`${chain.blockExplorers.default.url}/address/${address}`, '_blank')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`border-coral/30 hover:border-coral hover:bg-coral/5 ${className || ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-coral font-medium">
              {isBalanceLoading ? (
                <Loader2 className="h-3 w-3 animate-spin inline text-coral" />
              ) : (
                `${parseFloat(formatted || '0').toFixed(4)} ${symbol || 'ETH'}`
              )}
            </span>
            <div className="h-5 w-px bg-coral/30" />
            <Avatar className="h-6 w-6 ring-1 ring-coral/20">
              <AvatarImage src={avatarUrl || undefined} alt="Wallet avatar" />
              <AvatarFallback className="text-xs bg-gradient-to-br from-red-400 to-red-600 text-white">
                {address?.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-mono text-sm">{truncatedAddress}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          {copied ? t('wallet.copied') : t('wallet.copyAddress')}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('wallet.viewExplorer')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isDisconnecting ? t('wallet.disconnecting') : t('wallet.disconnect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
