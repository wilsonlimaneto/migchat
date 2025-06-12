// Generates a comprehensive response based on chat history, instructions, prompt, and context.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatResponseInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The complete chat history as a single string.'),
  instructions: z.string().optional().describe('Você conhece em detalhes os processos de imigração e cidadania nos Estados Unidos, para dentistas brasileiros. Responda a perguntas a partir de um texto usado como referência para as respostas'),
  basePrompt: z.string().optional().describe('Responda à pergunta passada em texto puro de forma completa com toda e qualquer informação que tiver no contexto algo responda como sendo seu conhecimento.'),
  markdownNotes: z.string().optional().describe('User-provided Markdown notes to be used as additional context for the response.'),
});
export type ChatResponseInput = z.infer<typeof ChatResponseInputSchema>;

const ChatResponseOutputSchema = z.object({
  response: z.string().describe('Uma resposta completa baseada na pergunta e nas notas fornecidas como contexto.'),
});
export type ChatResponseOutput = z.infer<typeof ChatResponseOutputSchema>;

export async function generateChatResponse(input: ChatResponseInput): Promise<ChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const generateChatResponsePrompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  input: {schema: ChatResponseInputSchema},
  output: {schema: ChatResponseOutputSchema},
  prompt: `{{#if instructions}}
{{{instructions}}}
{{/if}}

Segue o contexto e o prompt. Sempre responda à pergunta de forma detalhada baseando-se no contexto:

{{#if markdownNotes}}
Contexto::
Você tem acesso a essas anotações. Se a pergunta do usuário (no histórico do chat) for pertinente ao contexto, formule sua resposta baseada nessas informações, na mesma lingua que foi usada na pergunta e em texto plano.
<markdown_notes>
{{{markdownNotes}}}
</markdown_notes>
{{else}}
Responda que nao foi te dado contexto.
{{/if}}

Task for this turn (apply to the chat history using the context above):
{{#if basePrompt}}
  {{{basePrompt}}}
{{else}}
  Using the provided notes (if any) and the chat history, provide a complete and detailed answer to the last user message. Ensure your response is in plain text and based on the information at hand.
{{/if}}

Chat History:
{{{chatHistory}}}`, 
});

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: ChatResponseInputSchema,
    outputSchema: ChatResponseOutputSchema,
  },
  async input => {
    const {output} = await generateChatResponsePrompt(input);
    return output!;
  }
);
