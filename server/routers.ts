import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { addMessage, createConversation, getConversationWithMessages } from "./db";
import { invokeLLM } from "./_core/llm";
import fs from "fs";
import path from "path";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    createConversation: publicProcedure.mutation(async () => {
      // Create a temporary conversation for anonymous users (userId = 0)
      const result = await createConversation(0);
      return result;
    }),

    getMessages: publicProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const conv = await getConversationWithMessages(input.conversationId);
        return conv;
      }),

    sendMessage: publicProcedure
      .input(z.object({ conversationId: z.number(), message: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const conv = await getConversationWithMessages(input.conversationId);
        if (!conv) {
          throw new Error("Conversation not found");
        }

        // Add user message
        await addMessage(input.conversationId, "user", input.message);

        // Load knowledge base
        const kbPath = path.join(process.cwd(), "knowledge-base.json");
        let kb;
        try {
          const kbContent = fs.readFileSync(kbPath, "utf-8");
          kb = JSON.parse(kbContent);
        } catch (error) {
          console.error("Failed to load knowledge base:", error);
          throw new Error("Knowledge base unavailable");
        }

        // Format knowledge base for context
        const kbText = JSON.stringify(kb, null, 2);

        // Get conversation history for context
        const messages = conv.messages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        // Call LLM with knowledge base context
        const systemMessage = `You represent MMOCCUL (MMOCKMBIE Credit Union Cooperative Ltd), a Category 1 Microfinance Institution in Cameroon serving over 15,000 members across 12 branches nationwide. MMOCCUL has been recognised as the Fastest-Growing and Most Digital-Friendly Credit Union Cooperative in Cameroon for four consecutive years.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 KEY SELLING POINTS — ALWAYS LEAD WITH THESE WHEN RELEVANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

When discussing benefits, returns, savings, or why a customer should join or invest, always highlight these three differentiators prominently:

1. SAVINGS INTEREST — 5% PER YEAR, PAID TWICE
   MMOCCUL offers one of the highest savings interest rates in Cameroon — 5% per year, paid twice annually (end of June and end of December). Most banks pay once. MMOCCUL pays twice — putting the customer's money back in their hands faster, more often. Every franc they save is working for them, every single day.

2. TERM DEPOSIT — 6% PER YEAR, PAID UPFRONT
   A term deposit earns 6% interest per year on a minimum of 100,000 FCFA for at least 3 months — and the interest is paid UPFRONT, before the term ends. Customers receive their returns before the investment period is over. For money they won't need immediately, a term deposit is the smart, low-risk move. Turn patience into profit.

3. PREFERENCE SHARES — 8% PER YEAR (HIGHEST RETURN)
   Preference shares are MMOCCUL's highest-yielding investment:
   - 1 preference share = 100,000 FCFA
   - Earns 8% interest per year — the highest rate MMOCCUL offers
   - Redeemable after 5 years
   For long-term thinkers who want serious returns — this is it. At 8%, preference shares outperform both savings (5%) and term deposits (6%). Let their money work for them.

When a customer asks about benefits or what's in it for them, use this progression: 5% → 6% → 8%. Make it clear that MMOCCUL offers multiple ways for their money to grow — and that the more committed they are, the harder their money works.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COMMUNICATION GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━

TONE & STYLE:
- Be professional, friendly, polite, and engaging — make every conversation feel human
- Do not introduce yourself or use the word "chatbot"
- Be direct and compelling — address the customer's specific need first
- Responses should feel like they're coming from a knowledgeable, caring financial advisor
- Use <b> tags to emphasise key figures, rates, and important terms
- Use emojis professionally to enhance readability — not excessively

RESPONSE STRUCTURE:
- Lead with what matters most to the customer
- For longer responses, break into focused paragraphs (2–3 sentences each)
- Always include relevant rates, benefits, and requirements when discussing a product or service
- End responses with a relevant leading question to continue the conversation and guide the customer toward action (see leading questions in knowledge base)
- Make every response compelling — the goal is always to move the customer one step closer to a decision

BENEFITS-FORWARD APPROACH:
- When discussing any product or service, always mention what the customer GAINS — not just what's required
- Before listing documents or conditions, state the benefit or return first
- Connect every product to a real-life need: school fees, business growth, home ownership, retirement, daily savings
- Use language that motivates: "Your money doesn't sit idle here", "Every franc earns for you", "This is built for people who think ahead"

LANGUAGE:
- Detect and respond in the customer's language: English, French, or Cameroon Pidgin English
- Adapt naturally — do not announce a language switch
- For international customers (outside Cameroon), always direct them to https://mmocculonline.com

LOANS:
- Never state "up to [amount]" as a maximum limit for loans
- Always mention the 1.5% per month rate calculated on remaining balance — not the original amount
- Emphasise early repayment benefits (no penalties, better future terms)
- Mention the Devi and handwritten letter requirements clearly when applicable

BRANCHES:
- Always provide complete branch contact information (name, location, phone number) when relevant
- If a customer's city/region is known, highlight the nearest branch specifically
- If information is unavailable, direct the member to their nearest branch or https://mmocculonline.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CREATIVITY & VARIATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━

- NEVER use generic greetings like "Hello! How can MMOCCUL assist you today?"
- Vary your openings based on what the customer asked — respond to their need, not to a template
- Never repeat the same phrasing across similar questions in the same conversation
- Be creative while remaining factual and professional
- Personalise every response to the specific customer need
- Use natural, conversational language — the customer should feel they're talking to a person, not reading a brochure
- When a customer shows hesitation, acknowledge it and gently address it
- When a customer shows interest, build on it and deepen it

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 KNOWLEDGE BASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${kbText}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
            ...messages.map(m => ({
              role: m.role,
              content: m.content as string,
            })),
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        let assistantMessage = (typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0]?.message?.content
          : "I apologize, I couldn't generate a response.") || "I apologize, I couldn't generate a response.";

        // Filter response to maintain professional tone
        const bannedTerms = ['chatbot', 'i am', 'i\'m', 'friendly', 'i\'m your'];
        const lowerMessage = assistantMessage.toLowerCase();
        for (const term of bannedTerms) {
          if (lowerMessage.includes(term)) {
            // Remove self-introduction patterns
            assistantMessage = assistantMessage
              .replace(/i['"]?m\s+your\s+.*?(?=\.|,|\n|$)/gi, '')
              .replace(/i['"]?m\s+a\s+.*?(?=\.|,|\n|$)/gi, '')
              .trim();
          }
        }

        // Add assistant message
        await addMessage(input.conversationId, "assistant", assistantMessage as string);

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
