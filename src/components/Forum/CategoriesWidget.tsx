import { FC, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton, Badge } from "@heroui/react";
import Link from "next/link";
import useSWR from "swr";
import { getForumCategories } from "@/routes/api";
import { ForumCategory } from "@/types/Forum";

interface CategoriesWidgetProps {
  selectedSlug?: string;
}

const CategoriesWidget: FC<CategoriesWidgetProps> = ({ selectedSlug }) => {
  const { data: response, isLoading } = useSWR("forum/categories", getForumCategories, {
    revalidateOnFocus: false,
  });

  const categories: ForumCategory[] = response?.data || [];

  return (
    <Card className="border-2 border-gray-100 shadow-none">
      <CardHeader className="flex gap-3 px-4 py-3">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Categories</p>
          <p className="text-xs text-gray-600">Browse by topic</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/forum"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                !selectedSlug
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <span className="text-sm font-medium">All Categories</span>
              {/* Total count could be added here */}
            </Link>

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/forum?category_slug=${category.slug}`}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  selectedSlug === category.slug
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {category.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Badge
                  size="sm"
                  variant="flat"
                  className="text-xs"
                  color={selectedSlug === category.slug ? "default" : "primary"}
                >
                  {category.topics_count}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CategoriesWidget;
