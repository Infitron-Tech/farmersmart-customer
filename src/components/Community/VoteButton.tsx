import { ThumbsUp } from "lucide-react";
import { FC } from "react";
import { Button } from "@heroui/react";

interface VoteButtonProps {
  count: number;
  hasVoted: boolean;
  loading: boolean;
  disabled?: boolean;
  onVote: () => void;
  tooltipMessage?: string;
}

const VoteButton: FC<VoteButtonProps> = ({
  count,
  hasVoted,
  loading,
  disabled = false,
  onVote,
  tooltipMessage,
}) => {
  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      isLoading={loading}
      isDisabled={disabled || loading}
      onClick={onVote}
      title={disabled ? tooltipMessage : ""}
      className={`gap-2 ${hasVoted ? "text-primary" : "text-gray-500"}`}
    >
      <ThumbsUp size={16} fill={hasVoted ? "currentColor" : "none"} />
      <span className="text-xs">{count}</span>
    </Button>
  );
};

export default VoteButton;
