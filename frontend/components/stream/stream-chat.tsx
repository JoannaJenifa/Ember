'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Crown, DollarSign, Gift, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  sender_address: string;
  sender_name: string | null;
  message: string;
  is_seller: boolean;
  message_type?: 'message' | 'tip' | 'gift' | 'purchase';
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface StreamChatProps {
  streamId: string;
  className?: string;
}

const POLL_INTERVAL = 3000; // Poll every 3 seconds

export function StreamChat({ streamId, className }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (since?: string) => {
    try {
      const url = since
        ? `/api/streams/${streamId}/chat?since=${since}`
        : `/api/streams/${streamId}/chat?limit=100`;

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      const newMessages: ChatMessage[] = data.messages || [];

      if (since && newMessages.length > 0) {
        // Append new messages
        setMessages((prev) => [...prev, ...newMessages]);
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
      } else if (!since) {
        // Initial load
        setMessages(newMessages);
        if (newMessages.length > 0) {
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
        }
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setIsConnected(false);
    }
  }, [streamId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      // If we have messages, fetch only new ones since last message
      // If no messages yet, do a full fetch to check for new messages
      fetchMessages(lastMessageIdRef.current || undefined);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className={cn('bg-card border-border flex flex-col', className)}>
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageCircle className="h-5 w-5 text-ember" />
        <h2 className="font-semibold">Live Chat</h2>
        {isConnected && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Live
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Be the first to chat!
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

const ChatMessageItem = memo(function ChatMessageItem({
  message,
}: {
  message: ChatMessage;
}) {
  const displayName = message.sender_name || maskAddress(message.sender_address);
  const isTransaction = message.message_type && message.message_type !== 'message';

  // Transaction message styling - all use ember/orange theme
  if (isTransaction) {
    const Icon = message.message_type === 'tip' ? DollarSign
      : message.message_type === 'gift' ? Gift
      : ShoppingBag;

    return (
      <div className="flex items-center gap-2 text-sm p-2 rounded-lg border text-ember bg-ember/10 border-ember/30">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="font-medium">{displayName}</span>
        <span className="opacity-90">{message.message}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 text-sm">
      <div className="flex items-center gap-1 shrink-0">
        {message.is_seller && (
          <Crown className="h-3 w-3 text-amber-500" />
        )}
        <span
          className={cn(
            'font-medium',
            message.is_seller ? 'text-amber-500' : 'text-ember'
          )}
        >
          {displayName}
        </span>
        {message.is_seller && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-500 border-amber-500">
            Seller
          </Badge>
        )}
      </div>
      <span className="text-foreground break-words">{message.message}</span>
    </div>
  );
});

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
