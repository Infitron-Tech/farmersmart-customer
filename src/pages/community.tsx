import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import useSWR from "swr";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Skeleton,
  Divider,
  addToast,
} from "@heroui/react";
import {
  Search,
  Plus,
  Eye,
  MessageSquare,
  Pin,
  Lock,
  ChevronRight,
  Hash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getForumCategories, getForumTopics, createForumTopic } from "@/routes/api";
import { ForumCategory, ForumTopic } from "@/types/Forum";
import LandingLayout from "@/layouts/landing";
import { NextPageWithLayout } from "@/types";

// ── Create Topic Form ────────────────────────────────────────────────────────

function CreateTopicForm({
  categories,
  onSuccess,
  onCancel,
}: {
  categories: ForumCategory[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!categoryId || !title.trim() || !body.trim()) {
      addToast({ title: "Please fill all fields", color: "danger" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await createForumTopic({
        forum_category_id: Number(categoryId),
        title: title.trim(),
        body: body.trim(),
      });
      if (result.success) {
        addToast({ title: "Topic created!", color: "success" });
        onSuccess();
      }
    } catch {
      addToast({ title: "Failed to create topic", color: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Category"
        size="sm"
        selectedKeys={categoryId ? [categoryId] : []}
        onSelectionChange={(keys) => setCategoryId(String(Array.from(keys)[0] ?? ""))}
      >
        {categories.map((cat) => (
          <SelectItem key={String(cat.id)}>{cat.name}</SelectItem>
        ))}
      </Select>
      <Input
        label="Title"
        size="sm"
        placeholder="What's your question or topic?"
        value={title}
        onValueChange={setTitle}
        maxLength={120}
      />
      <Textarea
        label="Body"
        size="sm"
        placeholder="Share the details..."
        value={body}
        onValueChange={setBody}
        minRows={4}
        maxRows={10}
      />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="flat" onPress={onCancel} isDisabled={submitting}>
          Cancel
        </Button>
        <Button
          size="sm"
          color="primary"
          onPress={handleSubmit}
          isLoading={submitting}
          isDisabled={!categoryId || !title.trim() || !body.trim()}
        >
          Post Topic
        </Button>
      </div>
    </div>
  );
}

// ── Topic Row ────────────────────────────────────────────────────────────────

function TopicRow({ topic }: { topic: ForumTopic }) {
  const router = useRouter();
  const initial = topic.author?.name?.charAt(0)?.toUpperCase() ?? "?";
  const time = topic.last_activity_at ?? topic.created_at;

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
      onClick={() => router.push(`/forum/${topic.slug}`)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {topic.author?.profile_image ? (
          <img
            src={topic.author.profile_image}
            alt={topic.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initial}
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          {/* Category badge */}
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold text-white leading-none"
            style={{ backgroundColor: topic.category?.color ?? "#6b7280" }}
          >
            {topic.category?.name}
          </span>
          {topic.is_pinned && (
            <Pin size={11} className="text-amber-500 flex-shrink-0" />
          )}
          {topic.is_locked && (
            <Lock size={11} className="text-gray-400 flex-shrink-0" />
          )}
        </div>
        <p className="text-base font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
          {topic.title}
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          by {topic.author?.name}
        </p>
      </div>

      {/* Stats — hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0 text-sm text-gray-400">
        <span className="flex items-center gap-1 w-10 justify-end">
          <MessageSquare size={14} />
          {topic.comments_count}
        </span>
        <span className="flex items-center gap-1 w-12 justify-end">
          <Eye size={14} />
          {topic.views_count}
        </span>
        <span className="w-16 text-right">
          {formatDistanceToNow(new Date(time), { addSuffix: false })}
        </span>
      </div>
    </div>
  );
}

// ── Skeleton Row ─────────────────────────────────────────────────────────────

function TopicRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <div className="hidden sm:flex gap-5">
        <Skeleton className="h-3 w-8 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const ForumPage: NextPageWithLayout = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<"latest" | "top" | "most_commented">("latest");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const topicsKey = `forum/topics?sort=${sort}&cat=${activeCategory ?? ""}&q=${debouncedSearch}`;

  const { data: topicsRes, isLoading, mutate: mutateTopics } = useSWR(
    topicsKey,
    () => getForumTopics({
      page: 1,
      per_page: 30,
      sort,
      category_slug: activeCategory ?? undefined,
      search: debouncedSearch || undefined,
    })
  );

  const { data: categoriesRes } = useSWR("forum/categories", getForumCategories);

  const topics: ForumTopic[] = Array.isArray(topicsRes?.data) ? topicsRes.data : [];
  const categories: ForumCategory[] = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ask questions, share tips, connect with farmers
          </p>
        </div>
        {isMounted && isLoggedIn && (
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={() => setShowModal(true)}
          >
            New Topic
          </Button>
        )}
      </div>

      {/* ── Layout ── */}
      <div className="flex gap-6 items-start">

        {/* ── Left Sidebar: Categories ── */}
        <aside className="hidden lg:flex flex-col w-52 min-w-52 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </h3>
            </div>
            <div className="flex flex-col">
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                  activeCategory === null ? "text-primary font-medium bg-primary-50" : "text-gray-700"
                }`}
              >
                <Hash size={14} className="flex-shrink-0 text-gray-400" />
                All Topics
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                    activeCategory === cat.slug ? "text-primary font-medium bg-primary-50" : "text-gray-700"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-xs text-gray-400">{cat.topics_count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Search + Sort */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search discussions..."
              startContent={<Search size={16} className="text-gray-400" />}
              value={search}
              onValueChange={setSearch}
              isClearable
              onClear={() => setSearch("")}
              className="flex-1"
              classNames={{ inputWrapper: "bg-white border border-gray-200 shadow-none" }}
            />
            <Select
              className="w-44"
              selectedKeys={[sort]}
              onSelectionChange={(keys) => setSort(Array.from(keys)[0] as typeof sort)}
              aria-label="Sort"
              classNames={{ trigger: "bg-white border border-gray-200 shadow-none" }}
            >
              <SelectItem key="latest">Latest</SelectItem>
              <SelectItem key="top">Top Voted</SelectItem>
              <SelectItem key="most_commented">Most Discussed</SelectItem>
            </Select>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 lg:hidden scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
                activeCategory === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeCategory === cat.slug
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeCategory === cat.slug ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Topic Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* Table header */}
            <div className="hidden sm:flex items-center px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="flex-1">Topic</div>
              <div className="flex gap-5 flex-shrink-0">
                <span className="w-10 text-right">Replies</span>
                <span className="w-12 text-right">Views</span>
                <span className="w-16 text-right">Activity</span>
              </div>
            </div>

            {/* Rows */}
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <TopicRowSkeleton key={i} />)
            ) : topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <MessageSquare size={40} className="text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No discussions found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {search
                    ? `No results for "${search}"`
                    : "Be the first to start a conversation"}
                </p>
              </div>
            ) : (
              topics.map((topic) => <TopicRow key={topic.id} topic={topic} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ── */}
      {isMounted && isLoggedIn && (
        <button
          onClick={() => setShowModal(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-white hover:bg-primary-600 active:scale-95 transition-all"
          aria-label="New topic"
        >
          <Plus size={22} />
        </button>
      )}

      {/* ── New Topic Modal ── */}
      <Modal
        isOpen={showModal}
        onOpenChange={setShowModal}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base font-semibold">
                Start a Discussion
              </ModalHeader>
              <Divider />
              <ModalBody className="py-4">
                <CreateTopicForm
                  categories={categories}
                  onSuccess={() => {
                    onClose();
                    mutateTopics();
                  }}
                  onCancel={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

ForumPage.getLayout = (page) => (
  <LandingLayout showCTABanner={false}>{page}</LandingLayout>
);

export default ForumPage;
