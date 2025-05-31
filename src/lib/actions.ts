
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
