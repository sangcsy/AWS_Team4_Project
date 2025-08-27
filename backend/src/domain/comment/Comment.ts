export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCommentRequest {
  content: string;
  temperature_change?: number;
}

export interface UpdateCommentRequest {
  content?: string;
  temperature_change?: number;
}

export interface CommentResponse {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  temperature_change: number;
  created_at: Date;
  updated_at: Date;
  author_nickname?: string;
  author_temperature?: number;
}

export interface CommentListResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}
