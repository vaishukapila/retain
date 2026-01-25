'use server';

/**
 * @fileOverview A personalized product recommendation AI agent.
 *
 * - getPersonalizedRecommendations - A function that generates personalized product recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  pastPurchases: z
    .array(z.string())
    .describe('A list of the customer\'s past purchases (product names).'),
  frequentlyBoughtTogether: z
    .array(z.string())
    .describe('A list of products frequently bought together with the customer\'s past purchases.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of personalized product recommendations.'),
  reasoning: z
    .string()
    .describe('A short explanation of why these products were recommended.'),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return await personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an expert retail product recommendation engine.

  Based on a customer's past purchases and frequently bought together items, you will recommend products that the customer might be interested in.

  Past Purchases: {{pastPurchases}}
  Frequently Bought Together Items: {{frequentlyBoughtTogether}}

  Consider the customer's purchase history and suggest new and related products.
  Return a short explanation of why these products were recommended in the reasoning field.
  Limit the recommendations to 5 items.
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
