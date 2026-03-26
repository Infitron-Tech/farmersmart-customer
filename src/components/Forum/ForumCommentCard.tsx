import { FC, memo, useState } from "react";
import { Card, CardBody, Divider, Avatar, Button, Textarea } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { ForumComment } from "@/types/Forum";
import VoteButton from "./VoteButton";
import { Reply, Trash2, Edit2 } from "lucide-react";

interface ForumCommentCardProps {
  comment: ForumComment;
  isNested?: boolean;
  isOwner?: boolean;
  onVote?: () => void;
  onReply?: (parentId: number) => void;
  onEdit?: (id: number, body: string) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

const ForumCommentCard: FC<ForumCommentCardProps> = memo(
  ({
    comment,
    isNested = false,
    isOwner = false,
    onVote,
    onReply,
    onEdit,
    onDelete,
    isLoading = false,
    isLoggedIn = false,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);

    const handleSaveEdit = () => {
      if (editBody.trim() !== comment.body) {
        onEdit?.(comment.id, editBody);
      }
      setIsEditing(false);
    };

    return (
      <Card className={`border-2 border-gray-100 shadow-none ${isNested ? "ml-6 mt-3" : ""}`}>
        <CardBody className="gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <Avatar
                src={comment.author.profile_image}
                name={comment.author.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{comment.author.name}</div>
                <div className="text-xs text-gray-600">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="text-danger"
                  onClick={() => onDelete?.(comment.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="gap-2 flex flex-col">
              <Textarea
                value={editBody}
                onValueChange={setEditBody}
                minRows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="bordered" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" color="primary" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 break-words">{comment.body}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <VoteButton
                count={comment.upvotes_count}
                hasVoted={comment.has_voted}
                loading={isLoading}
                disabled={!isLoggedIn}
                onVote={onVote || (() => {})}
              />
              {isLoggedIn && !isNested && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => onReply?.(comment.id)}
                >
                  <Reply size={14} />
                </Button>
              )}
            </div>
          </div>
        </CardBody>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-6 mt-3 space-y-3">
            <Divider />
            {comment.replies.map((reply) => (
              <ForumCommentCard
                key={reply.id}
                comment={reply}
                isNested
                isOwner={isOwner}
                onVote={onVote}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </Card>
    );
  },
);

ForumCommentCard.displayName = "ForumCommentCard";

export default ForumCommentCard;
