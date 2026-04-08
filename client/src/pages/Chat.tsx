import { useEffect, useState } from "react";
import { ChatBox } from "@/components/ChatBox";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Chat() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createConversationMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (result: any) => {
      setConversationId(result[0]?.id || null);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  // Create a new conversation on first load
  useEffect(() => {
    if (!conversationId && isLoading) {
      createConversationMutation.mutate();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      {conversationId ? (
        <ChatBox conversationId={conversationId} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
