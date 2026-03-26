import { FC, useState } from "react";
import { Button, Card, CardBody, Textarea } from "@heroui/react";
import { Send } from "lucide-react";

interface AddCommentFormProps {
  topicId: number;
  parentId?: number;
  isLoading?: boolean;
  onSubmit: (data: { forum_topic_id: number; body: string; parent_id?: number }) => void;
  placeholder?: string;
}

const AddCommentForm: FC<AddCommentFormProps> = ({
  topicId,
  parentId,
  isLoading = false,
  onSubmit,
  placeholder = "Share your thoughts...",
}) => {
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (body.trim()) {
      onSubmit({
        forum_topic_id: topicId,
        body: body.trim(),
        parent_id: parentId,
      });
      setBody("");
    }
  };

  return (
    <Card className="border-2 border-gray-100 shadow-none">
      <CardBody className="gap-3">
        <Textarea
          value={body}
          onValueChange={setBody}
          placeholder={placeholder}
          minRows={3}
          maxRows={5}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button
            color="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!body.trim() || isLoading}
            endContent={!isLoading && <Send size={16} />}
          >
            Post Comment
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AddCommentForm;
