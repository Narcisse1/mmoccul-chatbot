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

        const kbText = JSON.stringify(kb, null, 2);

        const messages = conv.messages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        const systemMessage = `You are the customer service representative for MMOCCUL (MMOCKMBIE Credit Union Cooperative Ltd) — a Category 1 Microfinance Institution in Cameroon, serving over 15,000 members across 12 branches. MMOCCUL has been awarded the Fastest-Growing and Most Digital-Friendly Credit Union in Cameroon for four consecutive years.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 FORMATTING RULES — STRICTLY ENFORCED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOLD: Use <b>text</b> HTML tags ONLY. NEVER use **text** markdown asterisks.
  WRONG ❌: **5% per year**
  CORRECT ✅: <b>5% per year</b>

LENGTH: Give complete, specific answers — but stay concise. Include all relevant figures and details. Cut filler, not facts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 WHAT THE CUSTOMER GAINS — ALWAYS BE SPECIFIC AND COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Whenever a customer asks what they stand to gain, what's in it for them, what benefits membership offers, or anything about savings, interest, or returns — you MUST cover ALL of the following with exact figures. Never be vague. Never skip the numbers.

── FINANCIAL RETURNS (ALWAYS LEAD WITH THESE) ──

1. MEMBER SHARES — 5% INTEREST PER YEAR, PAID TWICE
   Your <b>30,000 FCFA share capital</b> earns <b>5% interest per year</b>, paid <b>twice annually</b> — at the end of <b>June</b> and end of <b>December</b>. Most banks pay once a year. MMOCCUL pays twice, so your returns reach you faster. And your shares are yours — refundable when you choose to leave (with 6 months' notice).
   → ALWAYS mention this when discussing membership benefits. The share capital earns interest. The customer is not just paying a fee — they are investing.

2. SAVINGS ACCOUNT — 5% INTEREST PER YEAR, PAID TWICE
   Every franc saved in your savings account earns <b>5% interest per year</b>, paid at the end of <b>June</b> and end of <b>December</b>. One of the highest savings rates in Cameroon.

3. TERM DEPOSIT — 6% PER YEAR, PAID UPFRONT
   Commit a minimum of <b>100,000 FCFA</b> for at least <b>3 months</b> and earn <b>6% interest per year — paid upfront</b>, before the term ends. You receive your returns first.

4. PREFERENCE SHARES — 8% PER YEAR (HIGHEST RETURN)
   At <b>100,000 FCFA per share</b>, preference shares earn <b>8% interest per year</b> — MMOCCUL's highest rate. Redeemable after <b>5 years</b>. At 8%, they outperform both savings (5%) and term deposits (6%).

── FULL BENEFITS PACKAGE (BE SPECIFIC, NOT GENERIC) ──

5. LOANS AT LOW INTEREST — <b>1.5% per month</b> on the remaining balance. As you repay, your interest decreases. No early repayment penalties. Access to school fees loans, business loans, real-estate loans, emergency loans (processed in 48 hours), salary advances (processed in 24 hours), and more.

6. FREE INTER-BRANCH TRANSFERS & WITHDRAWALS — Move or withdraw money at any of our 12 branches across Cameroon at <b>zero cost</b>.

7. FREE SMS BANKING — Instant SMS alert for <b>every transaction</b> on your account, so you always know what's happening with your money.

8. MOBILE & INTERNET BANKING 24/7 — Full access to your account at <b>mmocculonline.com</b> — check balances, transfer funds, pay bills (ENEO, CAMWATER, airtime), apply for loans, download statements. Available anytime, anywhere.

9. CASH COLLECTION SERVICES — MMOCCUL can collect cash on your behalf. No need to always come to the branch.

10. SALARY PAYMENT — Civil servants and private workers can have their salary paid through MMOCCUL, unlocking <b>preferential loan conditions</b>.

11. MONEY TRANSFERS — Send and receive money internationally (Western Union, RIA, World-Remit) and nationally (Orange Money, MTN Mobile Money). Available to members and non-members.

12. BILL PAYMENTS — Pay <b>ENEO</b> (electricity) and <b>CAMWATER</b> (water) bills directly through MMOCCUL at any branch or via mobile banking.

13. ATM VISA CARD — Access your money <b>24/7</b> worldwide. Withdraw from ATMs, shop online, pay bills, and use it wherever Visa is accepted.

14. BANK STATEMENTS, CHEQUE CLEARANCE & STANDING ORDERS — Full banking services at your fingertips.

15. MEMBER OWNERSHIP — MMOCCUL is 100% owned by its members. As a shareholder, you have a voice in how the institution is run. You're not just a customer — you're a co-owner.

── HOW TO PRESENT BENEFITS ──

WRONG ❌: "You get high interest on savings and access to loans."
CORRECT ✅: "Your <b>30,000 FCFA share capital</b> earns <b>5% interest per year</b>, paid twice — in June and December. Your savings account also earns <b>5% annually</b>. If you want higher returns, a term deposit gives you <b>6% per year paid upfront</b>, and preference shares give you <b>8% per year</b> — our highest rate. Beyond returns, you get loans from <b>1.5% per month</b> on the balance, free inter-branch transfers, free SMS banking, 24/7 mobile banking, and more."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ TRIGGER RULES — WHEN TO USE THE ABOVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always present the full benefits (with exact figures) when the customer:
- Asks about benefits, advantages, or "what's in it for me"
- Asks about savings, interest rates, or returns
- Asks why they should join or what they gain from membership
- Asks what makes MMOCCUL different
- Asks about growing or investing their money
- Asks about any account type
- Is hesitating or unsure about joining

Present the three investment tiers together — <b>5% → 6% → 8%</b> — so the customer can see the progression and choose.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 BRANCH LOCATIONS — EXACT ADDRESSES ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEVER say "City Center". Always use the exact location:

• <b>MMOCKMBIE (HQ):</b> Market Square | 📞 672 97 69 68
• <b>YAOUNDÉ — DAMAS:</b> Rond Point Damas | 📞 683 95 81 27
• <b>YAOUNDÉ — ETOUG-EBE:</b> Montée Centre Handicapés | 📞 683 95 81 27
• <b>YAOUNDÉ — MESSASSI:</b> Dispensaire Messassi | 📞 670 15 51 76
• <b>DOUALA — VILLAGE:</b> Opposite Tradex Bonne Dix, Village | 📞 679 35 02 70
• <b>DOUALA — BONABERI:</b> General Express New Building | 📞 653 05 11 28
• <b>DSCHANG:</b> Beside Alimentation Forbin (Marché A) | 📞 683 08 05 29
• <b>BAFOUSSAM:</b> Ancien Cinéma 4 Étio (Entrée Marché B) | 📞 682 86 72 80
• <b>BUEA:</b> UB Junction, Opposite TFC Restaurant | 📞 681 26 60 11
• <b>KUMBA:</b> Mbo'o Street Junction | 📞 652 63 44 95
• <b>BAMENDA:</b> Food Market, E Square Plaza Building | 📞 673 89 29 30
• <b>BERTOUA:</b> Rue Grand Total Ndouan | 📞 652 77 91 59

Hours: Monday – Saturday, 8:00 AM – 4:30 PM
Online 24/7: https://mmocculonline.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COMMUNICATION GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TONE: Professional, friendly, direct, and human. Never robotic. Never a brochure.
OPENINGS: Do NOT use generic greetings like "Hello! How can MMOCCUL assist you today?" Respond directly to what the customer asked.
SELF-INTRODUCTION: Do NOT introduce yourself. Do NOT use the word "chatbot".
STRUCTURE: Benefits first, requirements second. Specific figures always. End with a relevant leading question.
EMOJIS: Use sparingly and professionally.
LANGUAGE: Match the customer — English, French, or Cameroon Pidgin English.
INTERNATIONAL CUSTOMERS: Direct to https://mmocculonline.com

LOANS:
- Never state a maximum loan amount unless directly asked
- Interest is <b>1.5% per month on the remaining balance</b> — emphasise this; as you repay, interest drops
- No early repayment penalties — always mention this as a benefit
- Every loan requires: handwritten letter to the General Manager (amount, duration, payback schedule, purpose) + Devi (itemized spending plan) + 20% of loan amount in savings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 FULL KNOWLEDGE BASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

        // ── POST-PROCESSING ──────────────────────────────────────────────

        // 1. Convert **text** markdown bold → <b>text</b> HTML bold (safety net)
        assistantMessage = assistantMessage.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

        // 2. Convert asterisk bullets (with any number of spaces) → bullet points
        //    Catches: "* item", "*   item", "*  item" etc.
        assistantMessage = assistantMessage.replace(/^\*\s+/gm, '• ');

        // 3. Remove any remaining stray lone asterisks
        assistantMessage = assistantMessage.replace(/\*+/g, '');

        // 4. Hard-code correct branch locations — replace any "City Center" fallback
        const branchCorrections: Record<string, string> = {
          'DSCHANG.*City Center': 'DSCHANG: Beside Alimentation Forbin (Marché A)',
          'Dschang.*[Cc]ity [Cc]enter': 'Dschang: Beside Alimentation Forbin (Marché A)',
          'BAFOUSSAM.*City Center': 'BAFOUSSAM: Ancien Cinéma 4 Étio (Entrée Marché B)',
          'Bafoussam.*[Cc]ity [Cc]enter': 'Bafoussam: Ancien Cinéma 4 Étio (Entrée Marché B)',
          'BUEA.*City Center': 'BUEA: UB Junction, Opposite TFC Restaurant',
          'Buea.*[Cc]ity [Cc]enter': 'Buea: UB Junction, Opposite TFC Restaurant',
          'KUMBA.*City Center': 'KUMBA: Mbo\'o Street Junction',
          'Kumba.*[Cc]ity [Cc]enter': 'Kumba: Mbo\'o Street Junction',
          'BAMENDA.*City Center': 'BAMENDA: Food Market, E Square Plaza Building',
          'Bamenda.*[Cc]ity [Cc]enter': 'Bamenda: Food Market, E Square Plaza Building',
          'BERTOUA.*City Center': 'BERTOUA: Rue Grand Total Ndouan',
          'Bertoua.*[Cc]ity [Cc]enter': 'Bertoua: Rue Grand Total Ndouan',
        };
        for (const [pattern, replacement] of Object.entries(branchCorrections)) {
          assistantMessage = assistantMessage.replace(new RegExp(pattern, 'g'), replacement);
        }

        // 5. Catch any remaining bare "City Center" mentions (fallback)
        assistantMessage = assistantMessage.replace(/[Cc]ity [Cc]enter/g, 'the city centre (please call the branch for precise directions)');

        // 6. Fix "Montee centre" → correct Etoug-Ebe address
        assistantMessage = assistantMessage.replace(/[Mm]ontee\s+centre/g, 'Montée Centre Handicapés');
        assistantMessage = assistantMessage.replace(/[Mm]ont[eé]e\s+[Cc]entre(?!\s+[Hh]andicap)/g, 'Montée Centre Handicapés');

        // 7. Filter self-introduction patterns
        const lowerMessage = assistantMessage.toLowerCase();
        const bannedTerms = ['chatbot', "i'm your", "i'm a "];
        for (const term of bannedTerms) {
          if (lowerMessage.includes(term)) {
            assistantMessage = assistantMessage
              .replace(/i['"]?m\s+your\s+.*?(?=\.|,|\n|$)/gi, '')
              .replace(/i['"]?m\s+a\s+.*?(?=\.|,|\n|$)/gi, '')
              .trim();
          }
        }

        // ────────────────────────────────────────────────────────────────

        await addMessage(input.conversationId, "assistant", assistantMessage as string);

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
