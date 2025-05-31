
"use client";

import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageDisplay({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex items-start gap-3 message-bubble-animate", // Use items-start for better avatar alignment
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0"> {/* Added shrink-0 */}
          <AvatarImage src="https://placehold.co/40x40/D0BFFF/2F1A47.png?text=M" alt="Bot Avatar" data-ai-hint="robot face" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] md:max-w-[65%] rounded-xl px-4 py-3 shadow-md", // Adjusted max-width and rounded-xl
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-accent text-accent-foreground rounded-bl-none"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p> // Added whitespace-pre-wrap and break-words
        ) : (
          <div className="markdown-content prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ // Customize Markdown components if needed
                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"/>,
                // Add other custom renderers here
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className={cn(
            "text-xs mt-1.5 opacity-80", // Adjusted margin and opacity
            isUser ? "text-right" : "text-left" // Removed specific text color, inherit from parent
          )}>
          {format(new Date(message.timestamp), 'p')}
        </p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0"> {/* Added shrink-0 */}
          <AvatarImage src="https://placehold.co/40x40/B22222/FFFFFF.png?text=U" alt="User Avatar" data-ai-hint="person silhouette"/>
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
