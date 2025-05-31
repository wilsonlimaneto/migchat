
"use client";

import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageDisplay({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { toast } = useToast();

  const handleCopy = async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        toast({
          title: "Copied to clipboard!",
          description: "The message content has been copied.",
        });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the message to your clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 message-bubble-animate",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src="https://placehold.co/40x40/D0BFFF/2F1A47.png?text=M" alt="Bot Avatar" data-ai-hint="robot face" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] md:max-w-[65%] rounded-xl px-4 py-3 shadow-md relative group", // Added relative and group
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-accent text-accent-foreground rounded-bl-none"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="markdown-content prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"/>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <p className={cn(
              "text-xs opacity-80",
              isUser ? "text-right w-full" : "text-left" 
            )}>
            {format(new Date(message.timestamp), 'p')}
          </p>
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1.5 right-1.5 text-accent-foreground/70 hover:text-accent-foreground"
              onClick={handleCopy}
              title="Copy message"
            >
              <ClipboardCopy className="h-4 w-4" />
              <span className="sr-only">Copy message</span>
            </Button>
          )}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src="https://placehold.co/40x40/B22222/FFFFFF.png?text=U" alt="User Avatar" data-ai-hint="person silhouette"/>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
