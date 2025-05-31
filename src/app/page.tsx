
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ChatHistory from '@/components/chat/ChatHistory';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import type { ChatMessage } from '@/lib/types';
import { 
  sendMessageToGeminiAction, 
  getMarkdownNotesAction,  // Ensure this is imported
  saveMarkdownNotesAction, // Ensure this is imported
  getPromptEditorDataAction,
  savePromptEditorDataAction
} from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2, LogOut, MessageSquareDashed, Loader2, Notebook, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

  const [isPromptEditorModalOpen, setIsPromptEditorModalOpen] = useState(false);
  const [instructionsText, setInstructionsText] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isLoadingPromptEditorData, setIsLoadingPromptEditorData] = useState(false);
  const [isSavingPromptEditorData, setIsSavingPromptEditorData] = useState(false);
  
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
        try {
          const result = await getMarkdownNotesAction(); // Correctly call the action
          if (result.content !== undefined) {
            setMarkdownContent(result.content);
          } else if (result.error) {
            toast({ title: "Error loading notes", description: result.error, variant: "destructive" });
          }
        } catch (error) { // Catch any unexpected errors during the action call
          console.error("Failed to fetch notes:", error);
          toast({ title: "Error loading notes", description: "An unexpected error occurred.", variant: "destructive" });
        }
        setIsLoadingNotes(false);
      };
      fetchNotes();
    }
  }, [isNotesModalOpen, isAuthenticated, toast]);

  useEffect(() => {
    if (isPromptEditorModalOpen && isAuthenticated) {
      const fetchPromptData = async () => {
        setIsLoadingPromptEditorData(true);
        // Corrected to use try-catch for consistency and error handling
        try {
          const result = await getPromptEditorDataAction();
          if (result.data) {
            setInstructionsText(result.data.instructions);
            setPromptText(result.data.prompt);
          } else if (result.error) {
            toast({ title: "Error loading prompt data", description: result.error, variant: "destructive" });
          }
        } catch (error) {
          console.error("Failed to fetch prompt data:", error);
          toast({ title: "Error loading prompt data", description: "An unexpected error occurred.", variant: "destructive" });
        }
        setIsLoadingPromptEditorData(false);
      };
      fetchPromptData();
    }
  }, [isPromptEditorModalOpen, isAuthenticated, toast]);

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
    // Correctly call the action
    try {
      const result = await saveMarkdownNotesAction(markdownContent);
      if (result.success) {
        toast({ title: "Notes Saved", description: "Your notes have been successfully saved." });
        setIsNotesModalOpen(false);
      } else {
        toast({ title: "Error Saving Notes", description: result.error || "An unknown error occurred.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast({ title: "Error Saving Notes", description: "An unexpected error occurred.", variant: "destructive" });
    }
    setIsSavingNotes(false);
  };

  const handleSavePromptEditorData = async () => {
    setIsSavingPromptEditorData(true);
    // Corrected to use try-catch
    try {
      const result = await savePromptEditorDataAction({
        instructions: instructionsText,
        prompt: promptText,
      });
      if (result.success) {
        toast({ title: "Prompt Data Saved", description: "Instructions and Prompt have been saved." });
        setIsPromptEditorModalOpen(false);
      } else {
        toast({ title: "Error Saving Prompt Data", description: result.error || "An unknown error occurred.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save prompt data:", error);
      toast({ title: "Error Saving Prompt Data", description: "An unexpected error occurred.", variant: "destructive" });
    }
    setIsSavingPromptEditorData(false);
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
          <Button variant="ghost" size="icon" onClick={() => setIsPromptEditorModalOpen(true)} title="Edit Prompts" aria-label="Edit Prompts">
            <FileText className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
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

      {/* Markdown Notes Dialog */}
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

      {/* Prompt Editor Dialog */}
      <Dialog open={isPromptEditorModalOpen} onOpenChange={setIsPromptEditorModalOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl">Edit Prompt Configuration</DialogTitle>
            <DialogDescription>
              Modify the AI's instructions and base prompt. Changes are persisted (simulated).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-2 flex flex-col min-h-0 space-y-4 overflow-y-auto">
            {isLoadingPromptEditorData ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="instructionsText" className="text-sm font-medium">Instructions</Label>
                  <Textarea
                    id="instructionsText"
                    value={instructionsText}
                    onChange={(e) => setInstructionsText(e.target.value)}
                    className="w-full min-h-[200px] resize-y border rounded-md p-3 text-sm focus-visible:ring-primary"
                    placeholder="Enter AI instructions here..."
                    aria-label="AI Instructions Editor"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="promptText" className="text-sm font-medium">Base Prompt</Label>
                  <Textarea
                    id="promptText"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full min-h-[200px] resize-y border rounded-md p-3 text-sm focus-visible:ring-primary"
                    placeholder="Enter base prompt for the AI here..."
                    aria-label="AI Base Prompt Editor"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="p-6 pt-2 border-t mt-auto">
            <Button variant="outline" onClick={() => setIsPromptEditorModalOpen(false)} disabled={isSavingPromptEditorData}>
              Cancel
            </Button>
            <Button onClick={handleSavePromptEditorData} disabled={isSavingPromptEditorData || isLoadingPromptEditorData}>
              {isSavingPromptEditorData ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
