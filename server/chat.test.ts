import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("chat router - public API", () => {
  describe("createConversation", () => {
    it("should create a new conversation for anonymous users", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.createConversation();

      expect(result).toBeDefined();
      expect(result[0]).toBeDefined();
      expect(result[0].id).toBeGreaterThan(0);
      expect(result[0].title).toBeDefined();
    });
  });

  describe("getMessages", () => {
    it("should retrieve messages for a conversation", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      // Create a conversation first
      const convResult = await caller.chat.createConversation();
      const conversationId = convResult[0].id;

      // Get messages
      const conv = await caller.chat.getMessages({ conversationId });

      expect(conv).toBeDefined();
      expect(conv.id).toBe(conversationId);
      expect(Array.isArray(conv.messages)).toBe(true);
    });

    it("should return null for non-existent conversation", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getMessages({ conversationId: 99999 });

      expect(result).toBeNull();
    });
  });

  describe("sendMessage", () => {
    it("should fail with empty message", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      // Create a conversation
      const result = await caller.chat.createConversation();
      const conversationId = result[0].id;

      // Try to send empty message - should fail due to validation
      await expect(
        caller.chat.sendMessage({ conversationId, message: "" })
      ).rejects.toThrow();
    });

    it("should fail for non-existent conversation", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chat.sendMessage({
          conversationId: 99999,
          message: "Hello",
        })
      ).rejects.toThrow("Conversation not found");
    });

    it("should return a response from the assistant", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      // Create a conversation
      const result = await caller.chat.createConversation();
      const conversationId = result[0].id;

      // Send a message
      const response = await caller.chat.sendMessage({
        conversationId,
        message: "What is MMOCCUL?",
      });

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(typeof response.message).toBe("string");
      expect(response.message.length).toBeGreaterThan(0);
    }, { timeout: 30000 });

    it("should store messages in conversation history", async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      // Create a conversation
      const convResult = await caller.chat.createConversation();
      const conversationId = convResult[0].id;

      // Send a message
      await caller.chat.sendMessage({
        conversationId,
        message: "Tell me about accounts",
      });

      // Retrieve messages
      const updatedConv = await caller.chat.getMessages({ conversationId });

      expect(updatedConv.messages.length).toBeGreaterThanOrEqual(2); // user + assistant
      expect(updatedConv.messages[0].role).toBe("user");
      expect(updatedConv.messages[0].content).toBe("Tell me about accounts");
      expect(updatedConv.messages[1].role).toBe("assistant");
    }, { timeout: 30000 });
  });
});
