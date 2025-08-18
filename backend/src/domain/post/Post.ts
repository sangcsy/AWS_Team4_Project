export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  temperature_change?: number;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  temperature_change?: number;
}

export interface PostResponse {
  id: string;
  user_id: string;
  title: string;
  content: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
  author_nickname?: string;
  author_temperature?: number;
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}
