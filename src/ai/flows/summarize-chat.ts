// Summarizes the chat history to provide a brief overview of the conversation.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChatInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The complete chat history as a single string.'),
  instructions: z.string().optional().describe('Custom instructions to guide the AI model. This will be used as a preamble or system message.'),
  basePrompt: z.string().optional().describe('Custom base prompt that defines the primary task for the AI before processing the chat history.'),
  markdownNotes: z.string().optional().describe('User-provided Markdown notes to be used as additional context for the response.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;

const SummarizeChatOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chat history based on the provided instructions and prompt, and context from markdown notes.'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;

export async function summarizeChat(input: SummarizeChatInput): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {schema: SummarizeChatInputSchema},
  output: {schema: SummarizeChatOutputSchema},
  prompt: `{{#if instructions}}
{{{instructions}}}
{{/if}}

{{#if markdownNotes}}
Use the following notes as additional context for your response:
<markdown_notes>
{{{markdownNotes}}}
</markdown_notes>
{{/if}}

{{#if basePrompt}}
{{{basePrompt}}}
{{else}}
Respond to the last user message in the chat history.
{{/if}}

Chat History:
{{{chatHistory}}}`,
});

const summarizeChatFlow = ai.defineFlow(
  {
    name: 'summarizeChatFlow',
    inputSchema: SummarizeChatInputSchema,
    outputSchema: SummarizeChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
