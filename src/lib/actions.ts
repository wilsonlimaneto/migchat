
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
    
    // Use stored instructions and prompt if available
    const promptConfig = await getPromptEditorDataAction();
    let fullPrompt = input.chatHistory;
    if (promptConfig.data) {
        // This is a simplified example. A real app would integrate these into the Genkit flow's prompt template.
        // For summarizeChat, we are directly using the chatHistory.
        // If we were to use a more complex flow, instructions and base prompt would be part of its definition.
        // console.log("Using custom instructions:", promptConfig.data.instructions);
        // console.log("Using custom base prompt:", promptConfig.data.prompt);
    }


    // The current summarizeChat flow doesn't directly use the separate instructions/prompt fields.
    // This is a placeholder to show where they *could* be integrated.
    // For this specific action, we'll stick to the original summarization logic.
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
