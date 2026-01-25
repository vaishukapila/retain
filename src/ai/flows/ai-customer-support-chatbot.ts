'use server';

/**
 * @fileOverview An AI chatbot for customer support that uses a predefined FAQ.
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

const faq = `
PRODUCT AVAILABILITY & INFO (1–30)
- Is this product available? Yes, this product is currently in stock.
- Is milk available today? Yes, milk is available today.
- Do you have fresh bread? Yes, fresh bread is available.
- Is this item out of stock? Currently, this item is out of stock.
- When will it be restocked? It will be restocked in 2–3 days.
- Do you sell organic products? Yes, organic products are available.
- Is low-fat milk available? Yes, low-fat milk is available.
- Do you have sugar-free items? Yes, sugar-free items are available.
- Is this product fresh? Yes, all products are quality-checked.
- Do you sell frozen food? Yes, frozen food is available.
- Is rice available? Yes, rice is in stock.
- Do you sell snacks? Yes, snacks are available.
- Is bottled water available? Yes, bottled water is available.
- Do you sell fruits and vegetables? Yes, fresh produce is available.
- Is this brand available? Yes, this brand is available.
- Do you sell dairy products? Yes, dairy products are available.
- Is this product vegetarian? Yes, it is vegetarian.
- Do you sell baby products? Yes, baby products are available.
- Is pet food available? Yes, pet food is available.
- Do you sell bakery items? Yes, bakery items are available.
- Is cooking oil available? Yes, cooking oil is in stock.
- Do you sell spices? Yes, spices are available.
- Is coffee available? Yes, coffee is available.
- Do you sell tea? Yes, tea is available.
- Is chocolate available? Yes, chocolates are available.
- Do you sell ready-to-eat food? Yes, ready-to-eat items are available.
- Is this product seasonal? Yes, it is a seasonal product.
- Do you sell household items? Yes, household items are available.
- Is this product imported? Yes, it is an imported product.
- Do you sell eco-friendly products? Yes, eco-friendly products are available.

PRICING, OFFERS & PAYMENTS (31–55)
- What is the price of this item? The price is shown on the product card.
- Are there any discounts today? Yes, selected items have discounts.
- Is there a buy one get one offer? Yes, on selected products.
- Are prices inclusive of tax? Yes, prices include all taxes.
- Do you accept UPI payments? Yes, UPI is accepted.
- Do you accept debit or credit cards? Yes, cards are accepted.
- Is cash payment available? Yes, cash payment is available.
- Are there loyalty discounts? Yes, loyalty discounts are available.
- Do you offer cashback? Yes, on selected payments.
- Is there a first-time user offer? Yes, first-time users get offers.
- Do you offer bulk discounts? Yes, bulk discounts are available.
- Are weekend offers available? Yes, weekend offers are active.
- Do you offer EMI? Yes, EMI is available on select items.
- Is GST included in the price? Yes, GST is included.
- Do prices change daily? Prices may vary based on supply.
- Can I use coupons? Yes, valid coupons are accepted.
- Can I use multiple coupons? Only one coupon per order.
- Are festive offers available? Yes, festive offers are available.
- Is there a minimum order value? No minimum order value.
- Do you offer subscription discounts? Yes, subscription discounts are available.
- Are prices same online and in-store? Prices may vary slightly.
- Is there a membership program? Yes, membership is available.
- Do you offer gift cards? Yes, gift cards are available.
- Is billing fast? Yes, billing is quick.
- Are invoices provided? Yes, invoices are provided.

DELIVERY & ORDERS (56–75)
- Do you offer home delivery? Yes, home delivery is available.
- What is the delivery time? Delivery takes 1–2 days.
- Is same-day delivery available? Yes, in selected areas.
- Is delivery free? Free delivery on orders above ₹500.
- Can I track my order? Yes, order tracking is available.
- Can I cancel my order? Yes, before dispatch.
- Can I change delivery address? Yes, before order dispatch.
- Do you deliver on weekends? Yes, weekend delivery is available.
- Is contactless delivery available? Yes, contactless delivery is available.
- What if my order is delayed? You will be notified.
- Do you offer store pickup? Yes, store pickup is available.
- Are items packed securely? Yes, items are securely packed.
- Do you deliver frozen items? Yes, frozen items are delivered safely.
- Do you deliver daily essentials? Yes, daily essentials are prioritized.
- Is express delivery available? Yes, express delivery is available.
- Can I reschedule delivery? Yes, delivery can be rescheduled.
- Do you deliver to my area? Please check with your pin code.
- What if items are damaged? You can request a replacement.
- Is order confirmation sent? Yes, confirmation is sent.
- Can I view my order history? Yes, order history is available.

RETURNS, SUPPORT & STORE INFO (76–100)
- Can I return a product? Yes, returns are accepted.
- What is the return period? Returns are accepted within 7 days.
- Are refunds available? Yes, refunds are processed.
- How long does refund take? Refunds take 3–5 working days.
- Can I exchange items? Yes, exchanges are available.
- Are perishable items returnable? No, perishable items are not returnable.
- How do I raise a support ticket? Through the support section.
- Can I talk to customer support? Yes, customer support is available.
- What are store working hours? The store is open from 8 AM to 10 PM.
- Is the store open today? Yes, the store is open.
- Do you have parking facility? Yes, parking is available.
- Is the store wheelchair accessible? Yes, it is accessible.
- Is customer data safe? Yes, data is securely stored.
- Do you send email notifications? Yes, email notifications are sent.
- Do I receive order updates by email? Yes, order updates are emailed.
- Do you offer loyalty points? Yes, loyalty points are offered.
- How can I redeem loyalty points? At checkout.
- Do loyalty points expire? Yes, after a specific period.
- Are offers personalized? Yes, offers are personalized.
- Can I see my loyalty balance? Yes, in your account.
- Is AI assistant available 24/7? Yes, it is available 24/7.
- Can AI resolve my queries? Yes, most queries are automated.
- What if AI cannot solve my issue? A support ticket will be raised.
- Do you track my purchase history? Yes, for better recommendations.
- Is customer satisfaction prioritized? Yes, customer satisfaction is our priority.
`;


export async function aiCustomerSupportChatbot(input: AiCustomerSupportChatbotInput): Promise<AiCustomerSupportChatbotOutput> {
  try {
    return await aiCustomerSupportChatbotFlow(input);
  } catch (e: any) {
    console.error('Error in aiCustomerSupportChatbotFlow: ', e);
    let messageText = "Sorry, I'm having trouble connecting. Please try again later.";
    if (e?.message?.includes('quota')) {
      messageText =
        'The AI assistant is currently experiencing high demand and has exceeded its usage limit. Please try again later.';
    }
    return {
      response: messageText,
      escalateToAdmin: false,
    };
  }
}

const prompt = ai.definePrompt({
  name: 'aiCustomerSupportChatbotPrompt',
  input: {schema: AiCustomerSupportChatbotInputSchema},
  output: {schema: AiCustomerSupportChatbotOutputSchema},
  prompt: `You are a helpful customer support chatbot for an online grocery store called FreshMart. Your primary goal is to answer customer questions based on a provided list of Frequently Asked Questions (FAQs).

Follow these steps:
1. Analyze the user's query: \`{{{query}}}\`
2. Carefully compare the query to the questions in the FAQ list below.
3. If you find a direct or very close match, provide the corresponding answer from the FAQ. In this case, set \`escalateToAdmin\` to \`false\`.
4. If the user's query is NOT in the FAQ, or if you are unsure, you MUST set \`escalateToAdmin\` to \`true\` and respond with: "I'm sorry, I can't answer that question. I have created a support ticket for you, and an agent will be in touch shortly."
5. Do not invent answers or use any information outside of the provided FAQ list.

Here is the FAQ list:
${faq}
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
