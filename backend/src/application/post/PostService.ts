import { v4 as uuidv4 } from 'uuid';
import { PostRepository } from '../../domain/post/PostRepository';
import { Post, CreatePostRequest, UpdatePostRequest, PostResponse, PostListResponse } from '../../domain/post/Post';
import { NotificationService } from '../notification/NotificationService';
import { NotificationRepositoryImpl } from '../../infrastructure/notification/NotificationRepositoryImpl';

export class PostService {
  private notificationService: NotificationService;

  constructor(private postRepository: PostRepository) {
    const notificationRepository = new NotificationRepositoryImpl();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async createPost(postData: CreatePostRequest, userId: string): Promise<PostResponse> {
    console.log('📝 PostService.createPost - 입력 데이터:', postData);
    
    // 제목과 내용 검증
    if (!postData.title || postData.title.trim().length === 0) {
      throw new Error('제목을 입력해주세요.');
    }

    if (!postData.content || postData.content.trim().length === 0) {
      throw new Error('내용을 입력해주세요.');
    }

    // 온도 변화 기본값 설정
    const temperatureChange = postData.temperature_change || 0.0;

    console.log('📝 PostService.createPost - 검증된 데이터:', { 
      title: postData.title, 
      content: postData.content, 
      category: postData.category, 
      temperature_change: temperatureChange,
      userId 
    });

    const post = await this.postRepository.create(postData, userId);
    console.log('📝 PostService.createPost - 생성된 게시글:', post);
    
    return this.toPostResponse(post);
  }

  async getPostById(id: string): Promise<PostResponse | null> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      return null;
    }
    return this.toPostResponse(post);
  }

  async getPostsByUser(userId: string, page: number = 1, limit: number = 10): Promise<PostListResponse> {
    const result = await this.postRepository.findByUserId(userId, page, limit);
    
    const posts = result.posts.map(post => this.toPostResponse(post));
    
    return {
      posts,
      total: result.total,
      page,
      limit
    };
  }

  async getAllPosts(page: number = 1, limit: number = 10, currentUserId?: string): Promise<PostListResponse> {
    try {
      console.log('PostService.getAllPosts - params:', { page, limit, currentUserId }); // 디버깅용
      
      const result = await this.postRepository.findAll(page, limit, currentUserId);
      
      const posts = result.posts.map(post => this.toPostResponse(post));
      
      return {
        posts,
        total: result.total,
        page,
        limit
      };
    } catch (error) {
      console.error('PostService.getAllPosts - error:', error); // 디버깅용
      throw error;
    }
  }

  async updatePost(id: string, updates: UpdatePostRequest, userId: string): Promise<PostResponse> {
    // 게시글 존재 확인
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (existingPost.user_id !== userId) {
      throw new Error('게시글을 수정할 권한이 없습니다.');
    }

    // 업데이트 내용 검증
    if (updates.title !== undefined && updates.title.trim().length === 0) {
      throw new Error('제목을 입력해주세요.');
    }

    if (updates.content !== undefined && updates.content.trim().length === 0) {
      throw new Error('내용을 입력해주세요.');
    }

    const updatedPost = await this.postRepository.update(id, updates, userId);
    return this.toPostResponse(updatedPost);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    // 게시글 존재 확인
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 작성자 확인
    if (existingPost.user_id !== userId) {
      throw new Error('게시글을 삭제할 권한이 없습니다.');
    }

    await this.postRepository.delete(id, userId);
  }

  async updatePostTemperature(id: string, temperatureChange: number): Promise<PostResponse> {
    const post = await this.postRepository.updateTemperature(id, temperatureChange);
    return this.toPostResponse(post);
  }

  // 좋아요 토글
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    // 게시글 존재 확인
    const existingPost = await this.postRepository.findById(postId);
    if (!existingPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 좋아요 상태 확인 및 토글
    const result = await this.postRepository.toggleLike(postId, userId);
    
    // 좋아요를 눌렀다면 알림 생성 (자신의 게시글에는 알림 생성하지 않음)
    if (result.liked && existingPost.user_id !== userId) {
      console.log('🔔 좋아요 알림 생성 시작:', {
        postId,
        postOwnerId: existingPost.user_id,
        likerId: userId,
        isOwnPost: existingPost.user_id === userId
      });
      
      try {
        // 사용자 정보 조회 (닉네임 가져오기)
        const userRepository = new (await import('../../functions/auth/UserRepositoryImpl')).UserRepositoryImpl();
        const liker = await userRepository.findById(userId);
        
        console.log('🔔 좋아요 사용자 정보 조회 결과:', liker);
        
        if (liker) {
          console.log('🔔 좋아요 알림 생성 중...');
          await this.notificationService.createLikeNotification(
            postId,
            existingPost.user_id,
            userId,
            liker.nickname
          );
          console.log('✅ 좋아요 알림 생성 완료');
        } else {
          console.log('⚠️ 좋아요 사용자 정보를 찾을 수 없음');
        }
      } catch (error) {
        console.error('❌ 좋아요 알림 생성 실패:', error);
        // 알림 생성 실패는 좋아요 기능에 영향을 주지 않음
      }
    } else {
      console.log('🔔 좋아요 알림 생성 조건 불충족:', {
        resultLiked: result.liked,
        isOwnPost: existingPost.user_id === userId,
        postOwnerId: existingPost.user_id,
        likerId: userId
      });
    }
    
    return result;
  }

  // 게시글 검색
  async searchPosts(query: string): Promise<PostListResponse> {
    if (!query.trim()) {
      throw new Error('검색어를 입력해주세요.');
    }

    const result = await this.postRepository.searchPosts(query);
    
    const posts = result.posts.map(post => this.toPostResponse(post));
    
    return {
      posts,
      total: result.total,
      page: 1,
      limit: result.posts.length
    };
  }

  private toPostResponse(post: Post): PostResponse {
    return {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      category: post.category || '자유', // 카테고리 필드 추가
      temperature_change: post.temperature_change,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: post.user || {
        nickname: '알 수 없음',
        temperature: 36.5,
        email: ''
      },
      likes: post.likes || 0,
      isLiked: post.isLiked || false,
      comments: post.comments || []
    };
  }
}
