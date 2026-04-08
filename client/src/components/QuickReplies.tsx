import { Button } from "@/components/ui/button";

interface QuickRepliesProps {
  onSelectReply: (reply: string) => void;
  disabled?: boolean;
}

const QUICK_REPLIES = [
  "How do I open an account?",
  "What are the loan options?",
  "Tell me about mobile banking",
  "Where are your branches?",
  "What are the membership requirements?",
  "How do I apply for a loan?",
];

export function QuickReplies({ onSelectReply, disabled = false }: QuickRepliesProps) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Quick questions:</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <Button
            key={reply}
            variant="outline"
            size="sm"
            onClick={() => onSelectReply(reply)}
            disabled={disabled}
            className="text-xs h-auto py-1 px-3 rounded-full whitespace-normal text-left"
          >
            {reply}
          </Button>
        ))}
      </div>
    </div>
  );
}
