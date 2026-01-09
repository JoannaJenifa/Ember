'use client';

import { useState, useMemo } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAccountExplorerUrl } from '@/lib/aptos';
import { Copy, ExternalLink, LogOut, Wallet, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function WalletButton() {
  const isPrivyAvailable = usePrivyAvailable();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Generate DiceBear pixel-art avatar URL using address as seed
  const avatarUrl = useMemo(() => {
    if (!walletAddress) return null;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${walletAddress}`;
  }, [walletAddress]);

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

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
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error('Connect error:', error);
      setIsCreatingWallet(false);
    }
  };

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (walletAddress) {
      window.open(getAccountExplorerUrl(walletAddress), '_blank');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Disconnected');
  };

  // Loading state
  if (!ready || isCreatingWallet) {
    return (
      <Button variant="outline" size="sm" disabled className="h-10 px-3">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        {isCreatingWallet ? 'Connecting...' : 'Loading...'}
      </Button>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <Button
        variant="default"
        size="sm"
        className="h-10 px-4 bg-primary hover:bg-primary/90"
        onClick={handleConnect}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  // Connected state with avatar
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 px-3 gap-2">
          {/* Balance */}
          <span className="text-sm font-medium">
            {balanceLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              `${balance} MOVE`
            )}
          </span>

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Avatar */}
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || undefined} alt="Wallet avatar" />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {walletAddress?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Address - hidden on mobile */}
          <span className="font-mono text-sm hidden sm:inline">{shortAddress}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {/* Full address display */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono break-all">
          {walletAddress}
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? 'Copied!' : 'Copy Address'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleViewExplorer} className="gap-2 cursor-pointer">
          <ExternalLink className="h-4 w-4" />
          <span>View on Explorer</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
