import { Comment } from '../../domain/comment/Comment';
import { CommentRepository } from '../../domain/comment/CommentRepository';
import { UserRepository } from '../../domain/user/UserRepository';
import { v4 as uuidv4 } from 'uuid';

export class CommentService {
  private commentRepository: CommentRepository;
  private userRepository: UserRepository;

  constructor(commentRepository: CommentRepository, userRepository: UserRepository) {
    this.commentRepository = commentRepository;
    this.userRepository = userRepository;
  }

  async createComment(authorId: string, postId: string, content: string): Promise<Comment> {
    const comment = new Comment({
      id: uuidv4(),
      postId,
      authorId,
      content,
      createdAt: new Date(),
    });
    await this.commentRepository.save(comment);
    // 온도 상승
    const user = await this.userRepository.findById(authorId);
    if (user) {
      user.temperature += 0.1;
      await this.userRepository.save(user);
    }
    return comment;
  }

  async deleteComment(id: string, authorId: string): Promise<boolean> {
    const comment = await this.commentRepository.findById(id);
    if (!comment || comment.authorId !== authorId) return false;
    await this.commentRepository.delete(id);
    return true;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return this.commentRepository.findByPostId(postId);
  }
}