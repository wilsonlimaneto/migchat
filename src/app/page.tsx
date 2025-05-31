
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import type { ChatMessage } from '@/lib/types';
import { sendMessageToGeminiAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2, LogOut, MessageSquareDashed, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const authStatus = localStorage.getItem('gemini-chat-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
    }
    setIsAuthLoading(false);
  }, [router]);

  const handleSendMessage = async (content: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    const result = await sendMessageToGeminiAction(messages, content);
    setIsLoading(false);

    if (result.response) {
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } else if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      // To remove the user's optimistic message on API failure:
      // setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('gemini-chat-auth');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.replace('/login');
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="font-headline text-lg">Authenticating...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
     // This case should ideally not be reached if router.replace works fast enough
     // but serves as a fallback or if user manually navigates here without auth.
    return null; // Or a redirect / specific message
  }


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-border shadow-sm sticky top-0 bg-background z-10">
        <h1 className="text-xl font-headline font-semibold text-primary">Gemini Chat Dark</h1>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear Chat" aria-label="Clear Chat">
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Parent for ChatHistory and EmptyState */}
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MessageSquareDashed size={64} className="text-muted-foreground/50 mb-4" />
            <p className="text-xl font-headline text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground/80">Start a conversation by typing below.</p>
          </div>
        )}
        {messages.length > 0 && <ChatHistory messages={messages} />}
      </div>
      
      {isLoading && <TypingIndicator />}
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
