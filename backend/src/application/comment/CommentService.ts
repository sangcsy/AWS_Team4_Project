import { v4 as uuidv4 } from 'uuid';
import { CommentRepository } from '../../domain/comment/CommentRepository';
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentResponse, CommentListResponse } from '../../domain/comment/Comment';

export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async createComment(commentData: CreateCommentRequest, postId: string, userId: string): Promise<CommentResponse> {
    // 내용 검증
    if (!commentData.content || commentData.content.trim().length === 0) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    // 온도 변화 기본값 설정
    const temperatureChange = commentData.temperature_change || 0.0;

    const comment = await this.commentRepository.create(commentData, postId, userId);
    return this.toCommentResponse(comment);
  }

  async getCommentById(id: string): Promise<CommentResponse | null> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      return null;
    }
    return this.toCommentResponse(comment);
  }

  async getCommentsByPost(postId: string, page: number = 1, limit: number = 10): Promise<CommentListResponse> {
    try {
      console.log('CommentService.getCommentsByPost - params:', { postId, page, limit }); // 디버깅용
      
      const result = await this.commentRepository.findByPostId(postId, page, limit);
      
      const comments = result.comments.map(comment => this.toCommentResponse(comment));
      
      return {
        comments,
        total: result.total,
        page,
        limit
      };
    } catch (error) {
      console.error('CommentService.getCommentsByPost - error:', error); // 디버깅용
      throw error;
    }
  }

  async getCommentsByUser(userId: string, page: number = 1, limit: number = 10): Promise<CommentListResponse> {
    const result = await this.commentRepository.findByUserId(userId, page, limit);
    
    const comments = result.comments.map(comment => this.toCommentResponse(comment));
    
    return {
      comments,
      total: result.total,
      page,
      limit
    };
  }

  async updateComment(id: string, updates: UpdateCommentRequest, userId: string): Promise<CommentResponse> {
    // 댓글 존재 확인
    const existingComment = await this.commentRepository.findById(id);
    if (!existingComment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (existingComment.user_id !== userId) {
      throw new Error('댓글을 수정할 권한이 없습니다.');
    }

    // 업데이트 내용 검증
    if (updates.content !== undefined && updates.content.trim().length === 0) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    const updatedComment = await this.commentRepository.update(id, updates, userId);
    return this.toCommentResponse(updatedComment);
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    // 댓글 존재 확인
    const existingComment = await this.commentRepository.findById(id);
    if (!existingComment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (existingComment.user_id !== userId) {
      throw new Error('댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentRepository.delete(id, userId);
  }

  async updateCommentTemperature(id: string, temperatureChange: number): Promise<CommentResponse> {
    const comment = await this.commentRepository.updateTemperature(id, temperatureChange);
    return this.toCommentResponse(comment);
  }

  private toCommentResponse(comment: Comment): CommentResponse {
    return {
      id: comment.id,
      post_id: comment.post_id,
      user_id: comment.user_id,
      content: comment.content,
      temperature_change: comment.temperature_change,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    };
  }
}
