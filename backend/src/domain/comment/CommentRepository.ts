import { Comment } from './Comment';

export interface CommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  delete(id: string): Promise<void>;
}