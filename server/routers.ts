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
        const systemMessage = `You are MMOCCUL Customer Service Chatbot, a helpful assistant for MMOCCUL (MMOCKMBIE Credit Union Cooperative Ltd), a Category 1 Microfinance Institution in Cameroon with 12 branches and over 14,000 members.

IMPORTANT INSTRUCTIONS:
1. Answer customer questions using the provided knowledge base
2. Be conversational, friendly, and professional
3. Make responses action-oriented and compelling - encourage members to access MMOCCUL services
4. Keep responses direct and concise - not too lengthy
5. For long responses, split into multiple short messages (like WhatsApp) - each message 2-3 sentences max
6. Use <b> tags for bold text instead of markdown ** syntax
7. Be creative while staying factual
8. Always highlight benefits and value propositions
9. Encourage members to visit branches or use online banking at https://mmocculonline.com
10. If unsure, suggest contacting the nearest branch with their phone number

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

        const assistantMessage = (typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0]?.message?.content
          : "I apologize, I couldn't generate a response.") || "I apologize, I couldn't generate a response.";

        // Add assistant message
        await addMessage(input.conversationId, "assistant", assistantMessage as string);

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
