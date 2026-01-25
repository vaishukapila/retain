'use server';

/**
 * @fileOverview An AI chatbot for customer support.
 *
 * - aiCustomerSupportChatbot - A function that handles customer support queries.
 * - AiCustomerSupportChatbotInput - The input type for the aiCustomerSupportChatbot function.
 * - AiCustomerSupportChatbotOutput - The return type for the aiCustomerSupportChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The customer query.'),
});
export type AiCustomerSupportChatbotInput = z.infer<typeof AiCustomerSupportChatbotInputSchema>;

const AiCustomerSupportChatbotOutputSchema = z.object({
  response: z.string().describe('The response to the customer query.'),
  escalateToAdmin: z.boolean().describe('Whether the query should be escalated to an admin.'),
});
export type AiCustomerSupportChatbotOutput = z.infer<typeof AiCustomerSupportChatbotOutputSchema>;

export async function aiCustomerSupportChatbot(input: AiCustomerSupportChatbotInput): Promise<AiCustomerSupportChatbotOutput> {
  return aiCustomerSupportChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCustomerSupportChatbotPrompt',
  input: {schema: AiCustomerSupportChatbotInputSchema},
  output: {schema: AiCustomerSupportChatbotOutputSchema},
  prompt: `You are a customer support chatbot for an online retail store.
  Your goal is to answer customer questions about product availability, order tracking, returns & refunds, store information, and offers & loyalty points.
  If you cannot answer the question, or if the question is complex, set the escalateToAdmin field to true.

  Query: {{{query}}}
  `,
});

const aiCustomerSupportChatbotFlow = ai.defineFlow(
  {
    name: 'aiCustomerSupportChatbotFlow',
    inputSchema: AiCustomerSupportChatbotInputSchema,
    outputSchema: AiCustomerSupportChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
