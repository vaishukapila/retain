'use server';

/**
 * @fileOverview An AI chatbot for customer support for the FreshMart retail app.
 *
 * - aiCustomerSupportChatbot - A function that handles customer support queries.
 * - AiCustomerSupportChatbotInput - The input type for the aiCustomerSupportChatbot function.
 * - AiCustomerSupportChatbotOutput - The return type for the aiCustomerSupportChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The customer query.'),
  userName: z.string().optional().describe("The user's display name."),
});
export type AiCustomerSupportChatbotInput = z.infer<
  typeof AiCustomerSupportChatbotInputSchema
>;

const AiCustomerSupportChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe('Short natural language reply for the chat bubble.'),
  products: z
    .array(
      z.object({
        name: z.string().describe('Product name.'),
        sku: z.string().optional().describe('Optional SKU or ID.'),
        category: z.string().describe('Category.'),
        reason: z.string().describe('Why you recommend it.'),
      })
    )
    .optional()
    .describe('A list of recommended products.'),
});
export type AiCustomerSupportChatbotOutput = z.infer<
  typeof AiCustomerSupportChatbotOutputSchema
>;

export async function aiCustomerSupportChatbot(
  input: AiCustomerSupportChatbotInput
): Promise<AiCustomerSupportChatbotOutput> {
  return await aiCustomerSupportChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCustomerSupportChatbotPrompt',
  input: {schema: AiCustomerSupportChatbotInputSchema},
  output: {schema: AiCustomerSupportChatbotOutputSchema},
  prompt: `You are FreshMart AI, an assistant inside a grocery and retail web app.

Your responsibilities:
- Help users find products by name, category, brand, dietary needs, and price range.
- Suggest shopping lists and meal ideas using the store's product catalog.
- Answer common support questions: store hours, delivery options, returns, discounts, and how to use the app.
- Suggest relevant add-on items to increase basket value in a helpful, non-pushy way.

Behavior rules:
- Be concise: default to 2–4 short sentences unless the user explicitly asks for more detail.
- Always answer in a friendly, clear tone.
- If the user asks for product suggestions, you must respond in the format defined in the output schema, including the 'products' array.
- If the user is just asking a general question (no product suggestions needed), you can omit the 'products' field from the JSON output.
- If you don't know something (for example, exact live stock, exact price, or store-specific policy), say that you don't know and answer in general terms.
- Stay strictly in the context of groceries, household items, and customer support for FreshMart.
- The user's display name may be provided as 'userName'. Use it politely at most once per reply for personalization.
- Never invent products that are clearly unrealistic. Use generic names if you lack the exact catalog.
- Always return valid JSON as the final response, with no extra text before or after it.

User's query: {{{query}}}
{{#if userName}}User's name: {{{userName}}}{{/if}}
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
