'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  streamId: string;
  userAddress?: string;
  sellerAddress?: string;
  username?: string;
  isConnected?: boolean;
  className?: string;
}

export function ChatInput({
  streamId,
  userAddress,
  sellerAddress,
  username,
  isConnected = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Check if current user is the seller
  const isSeller = userAddress && sellerAddress
    ? userAddress.toLowerCase() === sellerAddress.toLowerCase()
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isConnected || !userAddress || isSending) return;

    setIsSending(true);
    try {
      await fetch(`/api/streams/${streamId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_address: userAddress,
          sender_name: username || null,
          message: trimmedMessage,
          is_seller: isSeller,
        }),
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={cn('p-4 bg-muted/50 rounded-lg', className)}>
        <p className="text-sm text-muted-foreground text-center">
          Connect wallet to chat
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isSeller ? 'Message your viewers...' : 'Type a message...'}
        maxLength={200}
        disabled={isSending}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isSending}
        className="shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
