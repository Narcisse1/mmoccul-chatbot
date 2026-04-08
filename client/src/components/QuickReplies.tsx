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
    <div className="quick-replies">
      <p className="quick-replies-label">Suggested questions:</p>
      <div className="quick-replies-container">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => onSelectReply(reply)}
            disabled={disabled}
            className="quick-reply-button"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
