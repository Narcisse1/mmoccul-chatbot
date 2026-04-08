import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MapPin, MoreVertical, Phone, Search } from "lucide-react";
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

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
      {/* WhatsApp Header */}
      <div className="chat-header">
        <div className="flex-1">
          <h2 className="chat-header-title">MMOCCUL Support</h2>
          <p className="chat-header-subtitle">Online • Always here to help</p>
        </div>
        <div className="flex gap-2">
          <button className="hover:bg-primary/20 p-2 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowBranchLocator(!showBranchLocator)}
            className="hover:bg-primary/20 p-2 rounded-full transition-colors"
            title="Find nearest branch"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button className="hover:bg-primary/20 p-2 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Branch Locator */}
      {showBranchLocator && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto max-h-96">
          <BranchLocator onClose={() => setShowBranchLocator(false)} />
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <h3 className="chat-empty-title">Welcome to MMOCCUL Support</h3>
            <p className="chat-empty-text">
              Ask us anything about accounts, loans, mobile banking, branches, or any other MMOCCUL services
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
                className={`chat-message-time ${
                  message.role === "user"
                    ? "text-primary-foreground"
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
          <div className="chat-loading">
            <div className="chat-loading-bubble">
              <Loader2 className="chat-loading-spinner text-primary" />
              <span className="chat-loading-text">Typing...</span>
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
        <div className="chat-input-wrapper">
          <Input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="chat-input"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="chat-send-button"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
