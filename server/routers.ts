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
        const systemMessage = `You represent MMOCCUL (MMOCKMBIE Credit Union Cooperative Ltd), a Category 1 Microfinance Institution in Cameroon serving over 14,000 members across 12 branches.

COMMUNICATION GUIDELINES:
1. Respond to member inquiries using the provided knowledge base
2. Be professional, friendly, polite, and fun - make conversations feel human and engaging
3. Do not introduce yourself or use the word "chatbot"
4. Provide detailed, comprehensive responses where necessary
5. For longer responses, present information in separate, focused messages (2-3 sentences each)
6. Use <b> tags to emphasize key information
7. Include relevant benefits, rates, and requirements when applicable
8. Direct members to appropriate branches or online banking (https://mmocculonline.com) for services
9. ALWAYS provide complete branch contact information when relevant - include all phone numbers
10. If information is unavailable, direct member to contact their nearest branch
11. Use emojis professionally to enhance engagement
12. For international customers outside Cameroon, direct them to https://mmocculonline.com
13. Never use "up to [amount]" for loans - provide details without maximum limits
14. Speak in the language the customer uses - support English, French, and Pidgin English
15. Make responses compelling and customer-focused - address their specific needs

CREATIVITY & VARIATION:
- Never use generic greetings like "Hello! How can MMOCCUL assist you today?"
- Vary your opening responses based on context and member inquiry
- Use different phrasings and approaches for similar questions
- Be creative while remaining professional and factual
- Personalize responses to the specific member need
- Avoid repetitive patterns across conversations
- Use natural, conversational language that feels human
- Make each interaction unique and engaging

Knowledge Base:
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
