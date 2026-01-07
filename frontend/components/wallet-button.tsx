'use client';

import { useWalletContext } from '@/hooks/use-wallet-context';
import { useMoveBalance } from '@/hooks/use-move-balance';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAccountExplorerUrl } from '@/lib/aptos';
import { Copy, ExternalLink, LogOut, Wallet, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function WalletButton() {
  const { walletAddress, isConnected, isReady, isPrivy, login, logout } = useWalletContext();
  const { balance, isLoading: balanceLoading } = useMoveBalance(walletAddress);
  const { wallets, connect } = useWallet();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied!');
    }
  };

  const openExplorer = () => {
    if (walletAddress) {
      window.open(getAccountExplorerUrl(walletAddress), '_blank');
    }
  };

  if (!isReady) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Wallet className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="bg-ember hover:bg-ember/90">
            <Wallet className="h-4 w-4 mr-2" />
            Connect
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={login}>
            <Wallet className="h-4 w-4 mr-2" />
            Social Login (Privy)
          </DropdownMenuItem>
          {wallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.name}
              onClick={() => connect(wallet.name)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {wallet.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="hidden sm:inline">
            {balanceLoading ? '...' : `${balance} MOVE`}
          </span>
          <span className="text-muted-foreground">
            {walletAddress ? formatAddress(walletAddress) : ''}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{isPrivy ? 'Privy Wallet' : 'External Wallet'}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {walletAddress ? formatAddress(walletAddress) : ''}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openExplorer}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-500">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
