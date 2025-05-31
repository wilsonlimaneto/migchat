
"use client";

import type { ChatMessage } from '@/lib/types';
import ChatMessageDisplay from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" viewportRef={viewportRef}>
      <div className="p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessageDisplay key={msg.id} message={msg} />
        ))}
      </div>
    </ScrollArea>
  );
}
