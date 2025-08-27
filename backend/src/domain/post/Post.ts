export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
  user?: {
    nickname: string;
    temperature: number;
    email: string;
  };
  likes?: number;
  isLiked?: boolean;
  comments?: Comment[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  temperature_change?: number;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  category?: string;
  temperature_change?: number;
}

export interface PostResponse {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
  user: {
    nickname: string;
    temperature: number;
    email: string;
  };
  likes?: number;
  isLiked?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  user?: {
    nickname: string;
  };
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}
