import { Comment, CreateCommentRequest, UpdateCommentRequest } from './Comment';

export interface CommentRepository {
  create(commentData: CreateCommentRequest, postId: string, userId: string): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string, page?: number, limit?: number): Promise<{ comments: Comment[], total: number }>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ comments: Comment[], total: number }>;
  update(id: string, updates: UpdateCommentRequest, userId: string): Promise<Comment>;
  delete(id: string, userId: string): Promise<void>;
  updateTemperature(id: string, temperatureChange: number): Promise<Comment>;
}
