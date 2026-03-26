import { FC, memo } from "react";
import { Card, CardBody, CardFooter, Divider, Badge } from "@heroui/react";
import { MessageCircle, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ForumTopic } from "@/types/Forum";
import VoteButton from "./VoteButton";
import { formatDistanceToNow } from "date-fns";

interface ForumTopicCardProps {
  topic: ForumTopic;
  onVote?: (slug: string) => void;
  isLoading?: boolean;
}

const ForumTopicCard: FC<ForumTopicCardProps> = memo(
  ({ topic, onVote, isLoading = false }) => {
    const handleVote = () => {
      onVote?.(topic.slug);
    };

    return (
      <Card className="border-2 border-gray-100 shadow-none hover:shadow-md transition-shadow">
        <CardBody className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {topic.is_pinned && (
                <Badge color="primary" variant="flat" size="sm" className="mb-2">
                  📌 Pinned
                </Badge>
              )}
              <Link
                href={`/forum/${topic.slug}`}
                className="text-base font-semibold hover:text-primary transition-colors line-clamp-2"
              >
                {topic.title}
              </Link>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <span>by {topic.author.name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
                {topic.is_locked && (
                  <>
                    <span>•</span>
                    <span className="text-warning">🔒 Locked</span>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant="flat"
              size="sm"
              className="text-xs"
              style={{
                backgroundColor: topic.category.color || "#e5e7eb",
              }}
            >
              {topic.category.name}
            </Badge>
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              {topic.views_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              {topic.comments_count}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              {topic.upvotes_count}
            </div>
          </div>
          <VoteButton
            count={topic.upvotes_count}
            hasVoted={topic.has_voted}
            loading={isLoading}
            disabled={false}
            onVote={handleVote}
            tooltipMessage="Login to upvote"
          />
        </CardFooter>
      </Card>
    );
  },
);

ForumTopicCard.displayName = "ForumTopicCard";

export default ForumTopicCard;
