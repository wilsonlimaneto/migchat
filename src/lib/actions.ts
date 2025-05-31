
"use server";

import type { ChatMessage } from '@/lib/types';
import { summarizeChat, type SummarizeChatInput } from '@/ai/flows/summarize-chat';
import { promises as fs } from 'fs';
import path from 'path';

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

  try {
    // Artificial delay to simulate API response time for loading indicator
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch stored instructions and prompt
    const promptConfigResult = await getPromptEditorDataAction();
    let instructions: string | undefined = undefined;
    let basePrompt: string | undefined = undefined;

    if (promptConfigResult.data) {
        instructions = promptConfigResult.data.instructions;
        basePrompt = promptConfigResult.data.prompt;
    } else if (promptConfigResult.error) {
        console.warn("Could not load custom prompt data:", promptConfigResult.error);
    }

    // Fetch user-editable markdown notes
    const notesResult = await getMarkdownNotesAction();
    let combinedNotes = '';

    if (notesResult.content) {
        combinedNotes += notesResult.content;
    }

    // Read migdata.md from the project root
    try {
      const migDataPath = path.join(process.cwd(), 'migdata.md');
      const migDataContent = await fs.readFile(migDataPath, 'utf-8');
      if (migDataContent) {
        if (combinedNotes) {
          combinedNotes += '\n\n--- Additional System Context (migdata.md) ---\n';
        } else {
            combinedNotes = '--- Additional System Context (migdata.md) ---\n';
        }
        combinedNotes += migDataContent;
      }
    } catch (readError) {
      console.warn("Could not load migdata.md for context:", readError);
      // Optionally, you could return an error or proceed without this context
    }
    
    const markdownNotes: string | undefined = combinedNotes || undefined;

    const input: SummarizeChatInput = {
      chatHistory: chatHistoryForApi,
      instructions: instructions,
      basePrompt: basePrompt,
      markdownNotes: markdownNotes,
    };
    
    const result = await summarizeChat(input);

    if (result && result.summary) {
      return { response: result.summary };
    } else {
      return { error: "Received an empty response from the AI." };
    }
  } catch (error) {
    console.error("Error calling summarizeChat flow:", error);
    if (error instanceof Error) {
      return { error: `API Error: ${error.message}` };
    }
    return { error: "An unknown error occurred while contacting the AI." };
  }
}

// --- Markdown Notes Actions ---

let storedMarkdownContent = `---DESCRIBE YOUR IDEAL FANTASY WORLD HERE---
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
    await new Promise(resolve => setTimeout(resolve, 500));
    storedMarkdownContent = newContent;
    return { success: true };
  } catch (error) {
    console.error("Error saving markdown notes:", error);
    if (error instanceof Error) {
      return { success: false, error: `Could not save notes: ${error.message}` };
    }
    return { success: false, error: "Could not save notes due to an unknown error." };
  }
}

// --- Prompt Editor Data Actions ---

let storedInstructionsContent = `You are a helpful AI assistant.
Your primary goal is to provide concise and accurate summaries of the chat history provided.
Focus on extracting key topics, decisions, and action items.
Maintain a neutral and objective tone.`;

let storedPromptContent = `Based on the chat history, provide a summary.`;

interface PromptEditorData {
  instructions: string;
  prompt: string;
}

export async function getPromptEditorDataAction(): Promise<{ data?: PromptEditorData; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate fetching delay
    return { data: { instructions: storedInstructionsContent, prompt: storedPromptContent } };
  } catch (error) {
    console.error("Error fetching prompt editor data:", error);
    if (error instanceof Error) {
      return { error: `Could not load prompt data: ${error.message}` };
    }
    return { error: "Could not load prompt data due to an unknown error." };
  }
}

export async function savePromptEditorDataAction(
  data: PromptEditorData
): Promise<{ success: boolean; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate saving delay
    storedInstructionsContent = data.instructions;
    storedPromptContent = data.prompt;
    // console.log("Prompt editor data saved (simulated):", data);
    return { success: true };
  } catch (error) {
    console.error("Error saving prompt editor data:", error);
    if (error instanceof Error) {
      return { success: false, error: `Could not save prompt data: ${error.message}` };
    }
    return { success: false, error: "Could not save prompt data due to an unknown error." };
  }
}

