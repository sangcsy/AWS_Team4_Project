import { v4 as uuidv4 } from 'uuid';
import { PostRepository } from '../../domain/post/PostRepository';
import { Post, CreatePostRequest, UpdatePostRequest, PostResponse, PostListResponse } from '../../domain/post/Post';

export class PostService {
  constructor(private postRepository: PostRepository) {}

  async createPost(postData: CreatePostRequest, userId: string): Promise<PostResponse> {
    // 제목과 내용 검증
    if (!postData.title || postData.title.trim().length === 0) {
      throw new Error('제목을 입력해주세요.');
    }

    if (!postData.content || postData.content.trim().length === 0) {
      throw new Error('내용을 입력해주세요.');
    }

    // 온도 변화 기본값 설정
    const temperatureChange = postData.temperature_change || 0.0;

    const post = await this.postRepository.create(postData, userId);
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

  async getAllPosts(page: number = 1, limit: number = 10): Promise<PostListResponse> {
    try {
      console.log('PostService.getAllPosts - params:', { page, limit }); // 디버깅용
      
      const result = await this.postRepository.findAll(page, limit);
      
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

  private toPostResponse(post: Post): PostResponse {
    return {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      temperature_change: post.temperature_change,
      created_at: post.created_at,
      updated_at: post.updated_at
    };
  }
}
