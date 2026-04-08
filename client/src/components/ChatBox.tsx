import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageSquare, MapPin } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { QuickReplies } from "./QuickReplies";
import { BranchLocator } from "./BranchLocator";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatBoxProps {
  conversationId: number;
}

export function ChatBox({ conversationId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBranchLocator, setShowBranchLocator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getMessagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId },
    { enabled: !!conversationId }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      // Add assistant message to the UI
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        },
      ]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    },
  });

  // Load initial messages
  useEffect(() => {
    if (getMessagesQuery.data?.messages) {
      setMessages(
        getMessagesQuery.data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [getMessagesQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Send message to backend
    await sendMessageMutation.mutateAsync({
      conversationId,
      message: messageToSend,
    });
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              MMOCCUL Support
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by AI • Always available
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowBranchLocator(!showBranchLocator)}
          className="text-primary hover:bg-primary/10"
          title="Find nearest branch"
        >
          <MapPin className="w-5 h-5" />
        </Button>
      </div>

      {/* Branch Locator */}
      {showBranchLocator && (
        <div className="border-b border-border bg-muted/30 p-4 overflow-y-auto max-h-96">
          <BranchLocator onClose={() => setShowBranchLocator(false)} />
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start a conversation
            </h3>
            <p className="text-muted-foreground max-w-xs">
              Ask us anything about accounts, loans, mobile banking, branches,
              or any other MMOCCUL services
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={
                message.role === "user"
                  ? "chat-message-user"
                  : "chat-message-assistant"
              }
            >
              {message.role === "assistant" ? (
                <Streamdown>{message.content}</Streamdown>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-primary-foreground opacity-70"
                    : "text-muted-foreground"
                }`}
              >
                {message.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-message-assistant flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 0 && !isLoading && (
        <QuickReplies onSelectReply={handleQuickReply} disabled={isLoading} />
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="chat-input-area">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-full"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
