import { PostService } from '../../application/post/PostService';
import { PostRepositoryImpl } from '../../infrastructure/post/PostRepositoryImpl';

export class PostController {
  private postService: PostService;

  constructor() {
    const postRepository = new PostRepositoryImpl();
    this.postService = new PostService(postRepository);
  }

  createPost = async (req, res) => {
    try {
      const { title, content, category, image_url, temperature_change } = req.body;
      const userId = req.user?.userId;

      console.log('📝 PostController.createPost - 요청 데이터:', { title, content, category, image_url, temperature_change, userId });

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const post = await this.postService.createPost({ title, content, category, image_url, temperature_change }, userId);

      res.status(201).json({
        success: true,
        message: '게시글이 작성되었습니다.',
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getPostById = async (req, res) => {
    try {
      const { id } = req.params;

      const post = await this.postService.getPostById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: '게시글을 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getAllPosts = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const currentUserId = req.user?.id; // JWT에서 사용자 ID 추출
      
      console.log('PostController.getAllPosts - params:', { page, limit, currentUserId });
      
      const result = await this.postService.getAllPosts(page, limit, currentUserId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('PostController.getAllPosts - error:', error);
      res.status(500).json({
        success: false,
        error: '게시글 목록을 가져오는데 실패했습니다.'
      });
    }
  };

  getPostsByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.postService.getPostsByUser(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  updatePost = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category, temperature_change } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const post = await this.postService.updatePost(id, { title, content, category, temperature_change }, userId);

      res.json({
        success: true,
        message: '게시글이 수정되었습니다.',
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  deletePost = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.postService.deletePost(id, userId);

      res.json({
        success: true,
        message: '게시글이 삭제되었습니다.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  updatePostTemperature = async (req, res) => {
    try {
      const { id } = req.params;
      const { temperature_change } = req.body;

      if (temperature_change === undefined) {
        return res.status(400).json({
          success: false,
          error: '온도 변화값을 입력해주세요.'
        });
      }

      const post = await this.postService.updatePostTemperature(id, temperature_change);

      res.json({
        success: true,
        message: '게시글 온도가 업데이트되었습니다.',
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  // 좋아요 토글
  toggleLike = async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔍 PostController.toggleLike - postId:', id);
      console.log('🔍 PostController.toggleLike - req.user:', req.user);
      console.log('🔍 PostController.toggleLike - req.user?.userId:', req.user?.userId);
      
      const userId = req.user?.userId;

      if (!userId) {
        console.error('❌ PostController.toggleLike - userId가 없음');
        console.error('❌ PostController.toggleLike - req.user:', req.user);
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      console.log('✅ PostController.toggleLike - userId 확인됨:', userId);
      const result = await this.postService.toggleLike(id, userId);

      res.json({
        success: true,
        message: result.liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
        data: result
      });
    } catch (error) {
      console.error('💥 PostController.toggleLike - Error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  // 게시글 검색
  searchPosts = async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: '검색어를 입력해주세요.'
        });
      }

      const result = await this.postService.searchPosts(q);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}
