'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Fuel, Sparkles } from 'lucide-react';

export interface TransactionDetails {
  title: string;
  description: string;
  items: { label: string; value: string; highlight?: boolean }[];
  icon?: React.ReactNode;
}

interface TransactionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: TransactionDetails | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  confirmText?: string;
}

interface GasInfo {
  isSponsored: boolean;
  isLoading: boolean;
}

async function checkSponsorshipEnabled(): Promise<boolean> {
  try {
    const response = await fetch('/api/shinami/sponsor');
    const data = await response.json();
    return data.enabled === true;
  } catch {
    return false;
  }
}

export function TransactionConfirmDialog({
  open,
  onOpenChange,
  details,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Confirm',
}: TransactionConfirmDialogProps) {
  const [gasInfo, setGasInfo] = useState<GasInfo>({
    isSponsored: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkSponsorship = async () => {
      if (!open) return;
      setGasInfo({ isSponsored: false, isLoading: true });
      try {
        const sponsored = await checkSponsorshipEnabled();
        setGasInfo({ isSponsored: sponsored, isLoading: false });
      } catch {
        setGasInfo({ isSponsored: false, isLoading: false });
      }
    };
    checkSponsorship();
  }, [open]);

  if (!details) return null;

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {details.icon}
            {details.title}
          </DialogTitle>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <div className="space-y-2 text-sm">
            {details.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={item.highlight ? 'font-bold text-ember' : 'font-medium'}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Gas Fee Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Fuel className="w-4 h-4" />
              Network Gas Fee
            </div>

            {gasInfo.isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gradient-to-r from-ember/5 to-ember/10 border border-ember/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Gas:</span>
                  {gasInfo.isSponsored ? (
                    <span className="px-2 py-0.5 rounded-full bg-ember text-white text-xs font-bold">
                      FREE
                    </span>
                  ) : (
                    <span className="text-sm font-medium">~0.0005 MOVE</span>
                  )}
                </div>

                {gasInfo.isSponsored && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-ember/10">
                    <Sparkles className="w-4 h-4 text-ember" />
                    <span className="text-xs text-muted-foreground">
                      Gas sponsored by{' '}
                      <a
                        href="https://shinami.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ember hover:underline font-medium"
                      >
                        Shinami
                      </a>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || gasInfo.isLoading}
            className="bg-ember hover:bg-ember/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reusable gas sponsorship section for embedding in other dialogs
export function GasSponsorshipSection({ className }: { className?: string }) {
  const [gasInfo, setGasInfo] = useState<GasInfo>({
    isSponsored: false,
    isLoading: true,
  });

  useEffect(() => {
    checkSponsorshipEnabled().then((sponsored) => {
      setGasInfo({ isSponsored: sponsored, isLoading: false });
    }).catch(() => {
      setGasInfo({ isSponsored: false, isLoading: false });
    });
  }, []);

  if (gasInfo.isLoading) {
    return (
      <div className={className}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!gasInfo.isSponsored) return null;

  return (
    <div className={`p-3 rounded-lg bg-gradient-to-r from-ember/5 to-ember/10 border border-ember/20 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-sm font-medium">
          <Fuel className="w-4 h-4" />
          Network Gas Fee
        </div>
        <span className="px-2 py-0.5 rounded-full bg-ember text-white text-xs font-bold">
          FREE
        </span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-ember/10">
        <Sparkles className="w-4 h-4 text-ember" />
        <span className="text-xs text-muted-foreground">
          Gas sponsored by{' '}
          <a
            href="https://shinami.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:underline font-medium"
          >
            Shinami
          </a>
        </span>
      </div>
    </div>
  );
}
