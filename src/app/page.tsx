
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import type { ChatMessage } from '@/lib/types';
import { sendMessageToGeminiAction, getMarkdownNotesAction, saveMarkdownNotesAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2, LogOut, MessageSquareDashed, Loader2, Notebook } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  useEffect(() => {
    const authStatus = localStorage.getItem('gemini-chat-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
    }
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isNotesModalOpen && isAuthenticated) {
      const fetchNotes = async () => {
        setIsLoadingNotes(true);
        const result = await getMarkdownNotesAction();
        if (result.content !== undefined) { // Check for undefined to allow empty string
          setMarkdownContent(result.content);
        } else if (result.error) {
          toast({ title: "Error loading notes", description: result.error, variant: "destructive" });
        }
        setIsLoadingNotes(false);
      };
      fetchNotes();
    }
  }, [isNotesModalOpen, isAuthenticated, toast]);

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

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const result = await saveMarkdownNotesAction(markdownContent);
    if (result.success) {
      toast({ title: "Notes Saved", description: "Your notes have been successfully saved." });
      setIsNotesModalOpen(false);
    } else {
      toast({ title: "Error Saving Notes", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
    setIsSavingNotes(false);
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
    return null; 
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-border shadow-sm sticky top-0 bg-background z-10">
        <h1 className="text-xl font-headline font-semibold text-primary">Migtech Hub Assistant</h1>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsNotesModalOpen(true)} title="Edit Notes" aria-label="Edit Notes">
            <Notebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear Chat" aria-label="Clear Chat">
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden">
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

      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl">Edit Markdown Notes</DialogTitle>
            <DialogDescription>
              Edit your notes below. Changes will be persisted on the server (simulated).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-2 flex flex-col min-h-0">
            {isLoadingNotes ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : (
              <Textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="flex-1 w-full h-full resize-none border rounded-md p-3 text-sm focus-visible:ring-primary"
                placeholder="Enter your markdown notes here..."
                aria-label="Markdown Notes Editor"
              />
            )}
          </div>
          <DialogFooter className="p-6 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsNotesModalOpen(false)} disabled={isSavingNotes}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={isSavingNotes || isLoadingNotes}>
              {isSavingNotes ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
