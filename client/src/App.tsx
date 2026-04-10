import { ArrowLeft, Video, Phone, MoreVertical, Smile, Paperclip, Mic, Send, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface MessageBubbleProps {
  text: string;
  time: string;
  isBot: boolean;
  status?: "sent" | "delivered" | "read";
}

interface DisplayMessage {
  text: string;
  time: string;
  isBot: boolean;
  status?: "sent" | "delivered" | "read";
}

function MessageBubble({ text, time, isBot, status }: MessageBubbleProps) {
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
          isBot
            ? "bg-white text-gray-800"
            : "bg-emerald-500 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm" dangerouslySetInnerHTML={{ __html: text }} />
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${isBot ? "text-gray-500" : "text-emerald-100"}`}>
            {time}
          </span>
          {!isBot && (
            <span className="text-emerald-100">
              {status === "read" ? (
                <CheckCheck className="w-4 h-4 text-blue-400" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
}

export default function App() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC hooks
  const createConversation = trpc.chat.createConversation.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();
  const getMessages = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const result = await createConversation.mutateAsync();
        const conversations = Array.isArray(result) ? result : [result];
        const conv = conversations[0];
        
        if (conv && conv.id) {
          setConversationId(conv.id);
          
          // Add welcome message
          setDisplayMessages([
            {
              text: "Hello! Welcome to MMOCCUL Customer Service. I'm here to help you with your credit union needs. How can I assist you today?",
              time: formatTime(new Date()),
              isBot: true,
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, []);

  // Update display messages when server messages change
  useEffect(() => {
    if (getMessages.data?.messages) {
      const formattedMessages: DisplayMessage[] = getMessages.data.messages.map((msg: any) => {
        const status: "sent" | "delivered" | "read" | undefined = msg.role === "user" ? "read" : undefined;
        return {
          text: msg.content,
          time: formatTime(new Date(msg.createdAt)),
          isBot: msg.role === "assistant",
          status,
        };
      });
      setDisplayMessages(formattedMessages);
    }
  }, [getMessages.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || isLoading) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      // Add user message to display
      const userStatus: "sent" | "delivered" | "read" = "sent";
      setDisplayMessages(prev => [...prev, {
        text: userMessage,
        time: formatTime(new Date()),
        isBot: false,
        status: userStatus,
      }]);

      // Send to API
      const response = await sendMessage.mutateAsync({
        conversationId,
        message: userMessage,
      });

      // Add bot response to display
      setDisplayMessages(prev => [...prev, {
        text: response.message,
        time: formatTime(new Date()),
        isBot: true,
        status: undefined,
      }]);

      // Refresh messages from server
      await getMessages.refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show error message
      setDisplayMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again.",
        time: formatTime(new Date()),
        isBot: true,
        status: undefined,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Fixed WhatsApp-style Chat Window */}
      <div className="w-full max-w-md h-screen max-h-[98vh] flex flex-col bg-[#e5ddd5] rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 text-white px-4 py-3 shadow-md flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-6 h-6 cursor-pointer hover:opacity-80" />
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/113294412/vjelJbwwyxEZxVOb.png"
                alt="MMOCCUL Logo"
                className="w-10 h-10 rounded-full object-cover bg-white p-1"
              />
              <div>
                <div className="font-semibold text-base">MMOCCUL</div>
                <div className="text-xs opacity-90">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Video className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" />
              <Phone className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" />
              <MoreVertical className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
          </div>
        </motion.header>

        {/* Chat Messages Area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='%23d9d9d9' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        >
          {displayMessages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MessageBubble {...msg} />
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white text-gray-800 rounded-lg px-3 py-2 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 px-3 py-2 flex items-center gap-2 flex-shrink-0 border-t border-gray-200"
        >
          <button className="text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0">
            <Smile className="w-6 h-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0">
            <Paperclip className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message"
            disabled={isLoading}
            className="flex-1 bg-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-sm"
          />
          {message.trim() ? (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-6 h-6" />
            </button>
          ) : (
            <button className="text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0">
              <Mic className="w-6 h-6" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
