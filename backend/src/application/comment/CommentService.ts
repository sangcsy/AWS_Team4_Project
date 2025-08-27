import { v4 as uuidv4 } from 'uuid';
import { CommentRepository } from '../../domain/comment/CommentRepository';
import { Comment, CreateCommentRequest, UpdateCommentRequest, CommentResponse, CommentListResponse } from '../../domain/comment/Comment';
import { NotificationService } from '../notification/NotificationService';
import { NotificationRepositoryImpl } from '../../infrastructure/notification/NotificationRepositoryImpl';

export class CommentService {
  private notificationService: NotificationService;

  constructor(private commentRepository: CommentRepository) {
    const notificationRepository = new NotificationRepositoryImpl();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async createComment(commentData: CreateCommentRequest, postId: string, userId: string): Promise<CommentResponse> {
    // 내용 검증
    if (!commentData.content || commentData.content.trim().length === 0) {
      throw new Error('댓글 내용을 입력해주세요.');
    }

    // 온도 변화 기본값 설정
    const temperatureChange = commentData.temperature_change || 0.0;

    const comment = await this.commentRepository.create(commentData, postId, userId);
    
    // 댓글 알림 생성
    try {
      console.log('🔔 댓글 알림 생성 시작:', { postId, userId, commentId: comment.id });
      
      // 게시글 작성자 정보 가져오기 (댓글 알림을 받을 사람)
      const postRepository = new (await import('../../infrastructure/post/PostRepositoryImpl')).PostRepositoryImpl();
      const post = await postRepository.findById(postId);
      
      if (post && post.user_id !== userId) { // 자기 자신의 게시글에 댓글을 다는 경우는 알림 생성 안함
        // 댓글 작성자 정보 가져오기
        const userRepository = new (await import('../../functions/auth/UserRepositoryImpl')).UserRepositoryImpl();
        const commenter = await userRepository.findById(userId);
        
        if (commenter) {
          await this.notificationService.createCommentNotification(
            postId,
            post.user_id, // 게시글 작성자
            userId,       // 댓글 작성자
            commenter.nickname
          );
          console.log('✅ 댓글 알림 생성 완료');
        }
      }
    } catch (error) {
      console.error('❌ 댓글 알림 생성 실패:', error);
      // 알림 생성 실패는 댓글 기능에 영향을 주지 않음
    }
    
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
