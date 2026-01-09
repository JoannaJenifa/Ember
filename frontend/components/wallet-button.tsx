'use client';

import { useState } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useMoveBalance } from '@/hooks/use-move-balance';
import { usePrivyAvailable } from '@/app/providers';
import { createMovementWallet } from '@/lib/privy-movement';
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
  const isPrivyAvailable = usePrivyAvailable();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  // Only use Privy hooks when available
  const privyHook = isPrivyAvailable ? usePrivy() : null;
  const createWalletHook = isPrivyAvailable ? useCreateWallet() : null;

  const authenticated = privyHook?.authenticated ?? false;
  const ready = privyHook?.ready ?? true;
  const user = privyHook?.user ?? null;
  const logout = privyHook?.logout ?? (async () => {});

  // Get Movement wallet from Privy user
  const movementWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'aptos'
  ) as any;

  const walletAddress = movementWallet?.address ?? null;
  const isConnected = authenticated && !!movementWallet;

  const { balance, isLoading: balanceLoading } = useMoveBalance(walletAddress);

  const handleWalletCreation = async (userToUse: any) => {
    if (!createWalletHook?.createWallet) return;
    try {
      setIsCreatingWallet(true);
      await createMovementWallet(userToUse, createWalletHook.createWallet);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast.error('Failed to create wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const loginHook = isPrivyAvailable
    ? useLogin({
        onComplete: async ({ user: completedUser }) => {
          try {
            await handleWalletCreation(completedUser);
          } catch (error) {
            console.error('Error in login completion:', error);
            setIsCreatingWallet(false);
          }
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setIsCreatingWallet(false);
        },
      })
    : null;

  const handleConnect = async () => {
    if (!isPrivyAvailable) {
      toast.error('Privy not configured');
      return;
    }

    try {
      setIsCreatingWallet(true);

      if (!authenticated) {
        await loginHook?.login({
          loginMethods: ['email'],
          disableSignup: false,
        });
      } else if (!movementWallet) {
        // Already authenticated but no wallet - create one
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error('Connect error:', error);
      setIsCreatingWallet(false);
    }
  };

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

  const handleLogout = async () => {
    await logout();
    toast.success('Disconnected');
  };

  if (!ready || isCreatingWallet) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Wallet className="h-4 w-4 mr-2" />
        {isCreatingWallet ? 'Connecting...' : 'Loading...'}
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        variant="default"
        size="sm"
        className="bg-primary hover:bg-primary/90"
        onClick={handleConnect}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
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
          <span>Privy Wallet</span>
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
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
