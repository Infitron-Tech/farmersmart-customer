import { FC } from "react";
import { Input, Select, SelectItem, Button } from "@heroui/react";
import { Search, Plus } from "lucide-react";
import { ForumCategory } from "@/types/Forum";
import Link from "next/link";

interface ForumFilterBarProps {
  categories: ForumCategory[];
  selectedCategory?: string;
  selectedSort?: string;
  searchTerm?: string;
  onCategoryChange: (slug: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (term: string) => void;
  isLoggedIn?: boolean;
}

const ForumFilterBar: FC<ForumFilterBarProps> = ({
  categories,
  selectedCategory = "",
  selectedSort = "latest",
  searchTerm = "",
  onCategoryChange,
  onSortChange,
  onSearchChange,
  isLoggedIn = false,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top row: Search + New Topic Button */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            placeholder="Search discussions..."
            startContent={<Search size={18} className="text-gray-400" />}
            value={searchTerm}
            onValueChange={onSearchChange}
            className="w-full"
          />
        </div>
        {isLoggedIn ? (
          <Link href="/forum/new">
            <Button color="primary" endContent={<Plus size={18} />}>
              New Topic
            </Button>
          </Link>
        ) : (
          <Button color="primary" disabled endContent={<Plus size={18} />}>
            New Topic
          </Button>
        )}
      </div>

      {/* Filter row: Category + Sort */}
      <div className="flex gap-3">
        <Select
          label="Category"
          selectedKeys={selectedCategory ? [selectedCategory] : []}
          onChange={(e) => onCategoryChange(e.target.value)}
          size="sm"
          className="max-w-xs"
        >
          <SelectItem key="" value="">
            All Categories
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.slug} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          label="Sort By"
          selectedKeys={[selectedSort]}
          onChange={(e) => onSortChange(e.target.value)}
          size="sm"
          className="max-w-xs"
        >
          <SelectItem key="latest" value="latest">
            Latest
          </SelectItem>
          <SelectItem key="top" value="top">
            Top Upvoted
          </SelectItem>
          <SelectItem key="most_commented" value="most_commented">
            Most Commented
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};

export default ForumFilterBar;
