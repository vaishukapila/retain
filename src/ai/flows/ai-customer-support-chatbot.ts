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

// Rate limiting configuration (in-memory)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_CALLS = 10; // Max 10 calls per user per minute
const userRequests = new Map<string, number[]>();

const FAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const AiCustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The customer query.'),
  userName: z.string().optional().describe("The user's display name."),
  userId: z.string().describe("The user's unique ID for rate limiting."),
  faqs: z
    .array(FAQSchema)
    .optional()
    .describe('A list of frequently asked questions to use as context.'),
});
export type AiCustomerSupportChatbotInput = z.infer<
  typeof AiCustomerSupportChatbotInputSchema
>;

// Define separate schemas for success and error responses
const SuccessResponseSchema = z.object({
  error: z.literal(false).optional(),
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

const ErrorResponseSchema = z.object({
  error: z.literal(true),
  code: z.string(),
  message: z.string(),
});

// The final output is a union of the two possible responses
const AiCustomerSupportChatbotOutputSchema = z.union([
  SuccessResponseSchema,
  ErrorResponseSchema,
]);

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
  // Note: The output schema for the prompt itself is the SUCCESS case,
  // as we handle errors in the flow logic.
  output: {schema: SuccessResponseSchema},
  prompt: `You are FreshMart AI, an assistant inside a grocery and retail web app.

{{#if faqs}}
First, check if the user's query can be answered from the following Frequently Asked Questions. If it is a close match, use the provided answer as your primary source of truth.

FAQs:
{{#each faqs}}
Q: {{question}}
A: {{answer}}
---
{{/each}}
{{/if}}

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
    // 1. Server-side Rate Limiting
    const now = Date.now();
    const userTimestamps = userRequests.get(input.userId) || [];
    const recentTimestamps = userTimestamps.filter(
      ts => now - ts < RATE_LIMIT_WINDOW_MS
    );

    if (recentTimestamps.length >= RATE_LIMIT_MAX_CALLS) {
      console.log(`Rate limit exceeded for user ${input.userId}`);
      return {
        error: true,
        code: 'RATE_LIMIT',
        message:
          'We’re getting a lot of AI requests right now. Please wait a few seconds and try again.',
      };
    }
    userRequests.set(input.userId, [...recentTimestamps, now]);

    // 2. Retry with Exponential Backoff
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        console.error(
          `AI generation attempt ${attempt + 1} failed for user ${
            input.userId
          }:`,
          JSON.stringify(e, null, 2)
        );

        // Check for 429 / Quota Exceeded error
        const isQuotaError =
          e.status === 429 ||
          e.code === 429 ||
          (typeof e.message === 'string' &&
            (e.message.includes('429') ||
              e.message.toLowerCase().includes('quota') ||
              e.message.toLowerCase().includes('rate limit') ||
              e.message.includes('RESOURCE_EXHAUSTED')));

        if (isQuotaError && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.log(
            `Quota error detected. Retrying in ${delay.toFixed(0)}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Continue to the next retry attempt
        }

        // If it's the last attempt or not a quota error, break and return a generic error
        break;
      }
    }

    // 3. Return generic error if all retries fail
    return {
      error: true,
      code: 'GENERATION_ERROR',
      message:
        "Sorry, I'm having trouble connecting. Please try again in a moment.",
    };
  }
);