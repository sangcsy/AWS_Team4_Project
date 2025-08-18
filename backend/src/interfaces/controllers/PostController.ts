const { PostService } = require('../../application/post/PostService');
const { PostRepositoryImpl } = require('../../infrastructure/post/PostRepositoryImpl');

class PostController {
  constructor() {
    const postRepository = new PostRepositoryImpl();
    this.postService = new PostService(postRepository);
  }

  createPost = async (req, res) => {
    try {
      const { title, content, temperature_change } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const post = await this.postService.createPost({ title, content, temperature_change }, userId);

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
      
      console.log('PostController.getAllPosts - params:', { page, limit }); // 디버깅용

      const result = await this.postService.getAllPosts(page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('PostController.getAllPosts - error:', error); // 디버깅용
      res.status(500).json({
        success: false,
        error: error.message
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
      const { title, content, temperature_change } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const post = await this.postService.updatePost(id, { title, content, temperature_change }, userId);

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
}

module.exports = { PostController };
