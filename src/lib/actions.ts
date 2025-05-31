
"use server";

import type { ChatMessage } from '@/lib/types';
import { summarizeChat, type SummarizeChatInput } from '@/ai/flows/summarize-chat';

// Helper function to format chat history for the API
function formatChatHistoryForApi(messages: ChatMessage[], newMessageContent: string): string {
  let historyString = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
    .join('\n');
  if (historyString) {
    historyString += '\n';
  }
  historyString += `User: ${newMessageContent}`;
  return historyString;
}

export async function sendMessageToGeminiAction(
  currentMessages: ChatMessage[],
  newMessageContent: string
): Promise<{ response?: string; error?: string }> {
  const chatHistoryForApi = formatChatHistoryForApi(currentMessages, newMessageContent);

  const input: SummarizeChatInput = {
    chatHistory: chatHistoryForApi,
  };

  try {
    // Artificial delay to simulate API response time for loading indicator
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await summarizeChat(input);
    if (result && result.summary) {
      return { response: result.summary };
    } else {
      return { error: "Received an empty response from the AI." };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      return { error: `API Error: ${error.message}` };
    }
    return { error: "An unknown error occurred while contacting the AI." };
  }
}

// --- Markdown Notes Actions ---

// Simulated server-side storage for Markdown notes
let storedMarkdownContent = `---
title: My Notes
date: ${new Date().toISOString().split('T')[0]}
tags: [markdown, demo, notes]
---

# Welcome to Your Markdown Notes!

This is a simple note-taking feature where you can write and save your thoughts using Markdown.

## Features
- **Edit and Save**: Modify the content in this textarea and click "Save Notes".
- **Markdown Support**: Use standard Markdown syntax like headers, lists, bold, italics, etc.
- **Persistence (Simulated)**: Your notes are "saved" on the server for the duration of this session.

## Example Content

### To-Do List
- [ ] Item 1
- [ ] Item 2
- [x] Completed Item

### Code Block
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

Start editing or replace this content with your own notes!
`;

export async function getMarkdownNotesAction(): Promise<{ content?: string; error?: string }> {
  try {
    // Simulate fetching delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { content: storedMarkdownContent };
  } catch (error) {
    console.error("Error fetching markdown notes:", error);
    if (error instanceof Error) {
      return { error: `Could not load notes: ${error.message}` };
    }
    return { error: "Could not load notes due to an unknown error." };
  }
}

export async function saveMarkdownNotesAction(
  newContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 500));
    storedMarkdownContent = newContent;
    // In a real app, you would save to a database or file system here.
    // console.log("Markdown notes saved (simulated):", newContent);
    return { success: true };
  } catch (error) {
    console.error("Error saving markdown notes:", error);
    if (error instanceof Error) {
      return { success: false, error: `Could not save notes: ${error.message}` };
    }
    return { success: false, error: "Could not save notes due to an unknown error." };
  }
}
