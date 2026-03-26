import { FC, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  Card,
  CardBody,
  Input,
  Button,
  Textarea,
  Select,
  SelectItem,
  Divider,
  addToast,
} from "@heroui/react";
import { Search, Plus, MessageSquare, Eye, TrendingUp } from "lucide-react";
import useSWR from "swr";
import {
  getForumCategories,
  getForumTopics,
  createForumTopic,
} from "@/routes/api";
import { ForumCategory, ForumTopic } from "@/types/Forum";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import LandingLayout from "@/layouts/landing";
import { NextPageWithLayout } from "@/types";

const ForumPage: NextPageWithLayout = () => {
  const router = useRouter();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ forum_category_id: "", title: "", body: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesRes } = useSWR("forum/categories", getForumCategories);
  const categories: ForumCategory[] = categoriesRes?.data || [];

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      const result = await getForumTopics({
        page: 1,
        per_page: 20,
        category_slug: selectedCategory,
        search: searchTerm,
      });
      setTopics(Array.isArray(result.data) ? result.data : []);
      setIsLoading(false);
    };
    fetchTopics();
  }, [selectedCategory, searchTerm]);

  const handleCreateTopic = async () => {
    if (!formData.forum_category_id || !formData.title || !formData.body) {
      addToast({
        title: "Error",
        description: "Please fill all fields",
        color: "danger",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createForumTopic({
        forum_category_id: parseInt(formData.forum_category_id),
        title: formData.title,
        body: formData.body,
      });

      if (result.success) {
        addToast({ title: "Topic created!", color: "success" });
        setFormData({ forum_category_id: "", title: "", body: "" });
        setShowCreateForm(false);
        // Refresh topics
        const refreshRes = await getForumTopics({ page: 1, per_page: 20 });
        setTopics(Array.isArray(refreshRes.data) ? refreshRes.data : []);
      }
    } catch (error) {
      addToast({ title: "Error creating topic", color: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
        <p className="text-gray-600">
          Connect with farmers and share knowledge
        </p>
      </div>

      {/* Create Topic Section */}
      {isLoggedIn && (
        <Card className="mb-8 border-2 border-primary">
          <CardBody className="gap-4">
            {!showCreateForm ? (
              <Button
                color="primary"
                size="lg"
                startContent={<Plus />}
                onClick={() => setShowCreateForm(true)}
              >
                Start a Discussion
              </Button>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Create New Topic</h3>
                <Select
                  label="Category"
                  selectedKeys={formData.forum_category_id ? [formData.forum_category_id] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, forum_category_id: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Title"
                  placeholder="What's your question or discussion about?"
                  value={formData.title}
                  onValueChange={(value) =>
                    setFormData({ ...formData, title: value })
                  }
                />
                <Textarea
                  label="Description"
                  placeholder="Provide details..."
                  value={formData.body}
                  onValueChange={(value) =>
                    setFormData({ ...formData, body: value })
                  }
                  minRows={4}
                />
                <div className="flex gap-2">
                  <Button
                    variant="bordered"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleCreateTopic}
                    isLoading={isSubmitting}
                  >
                    Post Topic
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="space-y-4 mb-8">
        <Input
          placeholder="Search discussions..."
          startContent={<Search size={18} />}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={selectedCategory === "" ? "solid" : "bordered"}
            color="primary"
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.slug ? "solid" : "bordered"}
              color="primary"
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No topics found. Be the first to start a discussion!
          </div>
        ) : (
          topics.map((topic) => (
            <Card
              key={topic.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              as={Link}
              href={`/forum/${topic.slug}`}
            >
              <CardBody className="gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {topic.body}
                    </p>
                  </div>
                  {topic.is_pinned && <span className="text-xl">📌</span>}
                </div>
                <Divider />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {topic.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {topic.comments_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} />
                      {topic.upvotes_count}
                    </span>
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(topic.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

ForumPage.getLayout = (page) => <LandingLayout>{page}</LandingLayout>;

export default ForumPage;
