'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getChatMessages,
  subscribeToChat,
  ChatMessage as SupabaseChatMessage,
} from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  senderAddress: string;
  senderName: string | null;
  message: string;
  isSeller: boolean;
  createdAt: Date;
}

interface StreamChatProps {
  streamId: string;
  className?: string;
}

export function StreamChat({ streamId, className }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and subscribe to realtime
  useEffect(() => {
    let subscription: ReturnType<typeof subscribeToChat> | null = null;

    async function init() {
      // Fetch existing messages
      const existingMessages = await getChatMessages(streamId);
      setMessages(existingMessages.map(mapToMessage));
      setIsConnected(true);

      // Subscribe to new messages
      subscription = subscribeToChat(streamId, (newMessage) => {
        setMessages((prev) => [...prev, mapToMessage(newMessage)]);
      });
    }

    init();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [streamId]);

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
  const displayName = message.senderName || maskAddress(message.senderAddress);

  return (
    <div className="flex gap-2 text-sm">
      <div className="flex items-center gap-1 shrink-0">
        {message.isSeller && (
          <Crown className="h-3 w-3 text-amber-500" />
        )}
        <span
          className={cn(
            'font-medium',
            message.isSeller ? 'text-amber-500' : 'text-ember'
          )}
        >
          {displayName}
        </span>
        {message.isSeller && (
          <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-500 border-amber-500">
            Seller
          </Badge>
        )}
      </div>
      <span className="text-foreground break-words">{message.message}</span>
    </div>
  );
});

function mapToMessage(row: SupabaseChatMessage): ChatMessage {
  return {
    id: row.id,
    senderAddress: row.sender_address,
    senderName: row.sender_name,
    message: row.message,
    isSeller: row.is_seller,
    createdAt: new Date(row.created_at),
  };
}

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
