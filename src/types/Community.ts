export interface CommunityCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  topics_count: number;
}

export interface CommunityAuthor {
  id: number;
  name: string;
  profile_image: string;
}

export interface CommunityTopic {
  id: number;
  slug: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  comments_count: number;
  upvotes_count: number;
  has_voted: boolean;
  last_activity_at: string | null;
  created_at: string;
  category: CommunityCategory;
  author: CommunityAuthor;
}

export interface CommunityComment {
  id: number;
  body: string;
  upvotes_count: number;
  has_voted: boolean;
  created_at: string;
  updated_at: string;
  author: CommunityAuthor;
  replies: CommunityComment[];
}

export interface CommunityContributor {
  id: number;
  name: string;
  profile_image: string;
  topics_count: number;
  comments_count: number;
  total_votes_received: number;
  score: number;
}

export interface PaginatedCommunityComments {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: CommunityComment[];
}

export interface CommunityTopicDetail extends CommunityTopic {
  comments: PaginatedCommunityComments;
}
