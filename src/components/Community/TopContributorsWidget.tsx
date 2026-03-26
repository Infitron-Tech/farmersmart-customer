import { FC } from "react";
import { Card, CardBody, CardHeader, Avatar, Divider, Skeleton } from "@heroui/react";
import useSWR from "swr";
import { getForumContributors } from "@/routes/api";
import { CommunityContributor } from "@/types/Community";

const TopContributorsWidget: FC = () => {
  const { data: response, isLoading } = useSWR("forum/contributors", getForumContributors, {
    revalidateOnFocus: false,
  });

  const contributors: CommunityContributor[] = response?.data || [];

  return (
    <Card className="border-2 border-gray-100 shadow-none">
      <CardHeader className="flex gap-3 justify-between px-4 py-3">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Top Contributors</p>
          <p className="text-xs text-gray-600">Forum leaders</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : contributors.length > 0 ? (
          <div className="space-y-3">
            {contributors.map((contributor, index) => (
              <div key={contributor.id} className="flex items-center gap-3 pb-2">
                <div className="font-bold text-primary text-xs w-5">{index + 1}</div>
                <Avatar
                  src={contributor.profile_image}
                  name={contributor.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{contributor.name}</div>
                  <div className="text-xs text-gray-600">Score: {contributor.score}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-4">No contributors yet</p>
        )}
      </CardBody>
    </Card>
  );
};

export default TopContributorsWidget;
