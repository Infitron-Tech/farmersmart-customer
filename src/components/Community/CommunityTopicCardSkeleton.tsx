import { FC } from "react";
import { Card, CardBody, CardFooter, Divider, Skeleton } from "@heroui/react";

const CommunityTopicCardSkeleton: FC = () => {
  return (
    <Card className="border-2 border-gray-100 shadow-none">
      <CardBody className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 gap-3 flex flex-col">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-12 rounded-lg" />
          <Skeleton className="h-3 w-12 rounded-lg" />
          <Skeleton className="h-3 w-12 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-12 rounded-lg" />
      </CardFooter>
    </Card>
  );
};

export default CommunityTopicCardSkeleton;
