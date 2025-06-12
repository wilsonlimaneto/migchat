
"use server";

import type { ChatMessage } from '@/lib/types';
import { generateChatResponse, type ChatResponseInput } from '@/ai/flows/summarize-chat';
import { promises as fs } from 'fs';
import path from 'path';

// Define file paths
const MARKDOWN_NOTES_PATH = path.join(process.cwd(), 'user_markdown_notes.md');
const INSTRUCTION_TEXT_PATH = path.join(process.cwd(), 'instruction.txt');
const PROMPT_TEXT_PATH = path.join(process.cwd(), 'prompt.txt');

// Default content for initial creation or if files are empty/corrupted
const DEFAULT_MARKDOWN_CONTENT = `---DESCRIBE YOUR IDEAL FANTASY WORLD HERE---
title: My Notes
date: ${new Date().toISOString().split('T')[0]}
tags: [markdown, demo, notes]
---

# Welcome to Your Markdown Notes!

This is a simple note-taking feature where you can write and save your thoughts using Markdown.

## Features
- **Edit and Save**: Modify the content in this textarea and click "Save Notes".
- **Markdown Support**: Use standard Markdown syntax like headers, lists, bold, italics, etc.
- **Persistence**: Your notes are saved to user_markdown_notes.md.

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

const DEFAULT_INSTRUCTIONS_CONTENT = `Voce conhece em detalhes os processos de imigração e cidadania nos Estados Unidos, para dentistas brasileiros. Gerar uma resposta em formato plain-text paras as perguntas feitas a você`;

const DEFAULT_PROMPT_CONTENT = `Responda à pergunta feita baseado no texto passado como contexto.`;


// Helper function to format chat history for the API
function formatChatHistoryForApi(messages: ChatMessage[], newMessageContent: string): string {
  let historyString = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`)
    .join(' ');
  if (historyString) {
    historyString += ' ';
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
    
    const promptConfigResult = await getPromptEditorDataAction();
    let instructions: string | undefined = undefined;
    let basePrompt: string | undefined = undefined;

    if (promptConfigResult.data) {
        instructions = promptConfigResult.data.instructions;
        basePrompt = promptConfigResult.data.prompt;
    } else if (promptConfigResult.error) {
        console.warn("Could not load custom prompt data:", promptConfigResult.error);
    }

    const notesResult = await getMarkdownNotesAction();
    let combinedNotes = '';

    if (notesResult.content) {
        combinedNotes += notesResult.content;
    }
    
    const markdownNotes: string | undefined = combinedNotes || undefined;

    const input: ChatResponseInput = {
      chatHistory: chatHistoryForApi,
      instructions: instructions,
      basePrompt: basePrompt,
      markdownNotes: markdownNotes,
    };
    
    const result = await generateChatResponse(input);

    if (result && result.response) {
      return { response: result.response };
    } else {
      return { error: "Received an empty response from the AI." };
    }
  } catch (error) {
    console.error("Error calling generateChatResponse flow:", error);
    if (error instanceof Error) {
      return { error: `API Error: ${error.message}` };
    }
    return { error: "An unknown error occurred while contacting the AI." };
  }
}

// --- Markdown Notes Actions ---

export async function getMarkdownNotesAction(): Promise<{ content?: string; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    try {
      const content = await fs.readFile(MARKDOWN_NOTES_PATH, 'utf-8');
      return { content: content || DEFAULT_MARKDOWN_CONTENT };
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        // File doesn't exist, return default content
        return { content: DEFAULT_MARKDOWN_CONTENT };
      }
      throw readError; // Re-throw other errors
    }
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
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    await fs.writeFile(MARKDOWN_NOTES_PATH, newContent, 'utf-8');
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

interface PromptEditorData {
  instructions: string;
  prompt: string;
}

export async function getPromptEditorDataAction(): Promise<{ data?: PromptEditorData; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    let instructions = DEFAULT_INSTRUCTIONS_CONTENT;
    let prompt = DEFAULT_PROMPT_CONTENT;

    try {
      instructions = await fs.readFile(INSTRUCTION_TEXT_PATH, 'utf-8');
    } catch (readError: any) {
      if (readError.code !== 'ENOENT') {
        console.warn(`Error reading ${INSTRUCTION_TEXT_PATH}, using default. Error: ${readError.message}`);
      }
      // If ENOENT or other read error, default is already set
    }

    try {
      prompt = await fs.readFile(PROMPT_TEXT_PATH, 'utf-8');
    } catch (readError: any) {
      if (readError.code !== 'ENOENT') {
        console.warn(`Error reading ${PROMPT_TEXT_PATH}, using default. Error: ${readError.message}`);
      }
      // If ENOENT or other read error, default is already set
    }
    
    return { data: { instructions: instructions || DEFAULT_INSTRUCTIONS_CONTENT, prompt: prompt || DEFAULT_PROMPT_CONTENT } };

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
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    await fs.writeFile(INSTRUCTION_TEXT_PATH, data.instructions, 'utf-8');
    await fs.writeFile(PROMPT_TEXT_PATH, data.prompt, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error("Error saving prompt editor data:", error);
    if (error instanceof Error) {
      return { success: false, error: `Could not save prompt data: ${error.message}` };
    }
    return { success: false, error: "Could not save prompt data due to an unknown error." };
  }
}
