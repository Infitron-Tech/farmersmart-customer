import { FC, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Divider, Input, Spacer, addToast } from "@heroui/react";
import { MessageSquare, TrendingUp, Eye } from "lucide-react";
import useSWR from "swr";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  getForumCategories,
  getForumTopics,
  createForumTopic,
  createForumComment,
} from "@/routes/api";
import { ForumCategory, ForumTopic } from "@/types/Forum";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const ForumSection: FC = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: categoriesRes } = useSWR("forum/categories", getForumCategories);
  const categories: ForumCategory[] = categoriesRes?.data || [];

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      const result = await getForumTopics({
        page: 1,
        per_page: 10,
        category_slug: selectedCategory,
        sort: "latest",
      });
      if (result.data) {
        setTopics(Array.isArray(result.data) ? result.data : []);
      }
      setIsLoading(false);
    };
    fetchTopics();
  }, [selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Community Forum</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with farmers, share experiences, and get answers to your questions
          </p>
        </motion.div>

        {/* Categories */}
        {categories.length > 0 && (
          <motion.div
            className="flex gap-2 overflow-x-auto pb-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.button
              key="all"
              variants={itemVariants}
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === ""
                  ? "bg-primary text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Topics Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-gray-200 h-32 rounded-lg animate-pulse"
              />
            ))
          ) : topics.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-600">
              No discussions yet. Be the first to start one!
            </div>
          ) : (
            topics.map((topic) => (
              <motion.div key={topic.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardBody className="gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {topic.title}
                      </h3>
                      {topic.is_pinned && <span className="text-lg">📌</span>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {topic.body}
                    </p>
                    <Divider />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex gap-3">
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
              </motion.div>
            ))
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/forum">
            <Button size="lg" color="primary">
              Explore Full Forum →
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ForumSection;
