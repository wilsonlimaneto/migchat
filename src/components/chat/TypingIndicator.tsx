
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 md:px-6 py-2 message-bubble-animate"> {/* Consistent padding */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src="https://placehold.co/40x40/D0BFFF/2F1A47.png?text=M" alt="Bot Avatar" data-ai-hint="robot face" />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-md bg-accent text-accent-foreground rounded-bl-none">
        <div className="flex space-x-1.5 items-center"> {/* Increased space slightly */}
          <span className="text-sm font-medium">Bot is thinking</span> {/* Added font-medium */}
          <div className="h-2 w-2 bg-accent-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-accent-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-accent-foreground/60 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
