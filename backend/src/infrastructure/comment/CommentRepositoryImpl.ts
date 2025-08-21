import { Comment } from '../../domain/comment/Comment';
import { CommentRepository } from '../../domain/comment/CommentRepository';

export class CommentRepositoryImpl implements CommentRepository {
  private comments: Comment[] = [];

  async findById(id: string): Promise<Comment | null> {
    return this.comments.find(c => c.id === id) || null;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.postId === postId);
  }

  async save(comment: Comment): Promise<void> {
    this.comments.push(comment);
  }

  async delete(id: string): Promise<void> {
    this.comments = this.comments.filter(c => c.id !== id);
  }
}