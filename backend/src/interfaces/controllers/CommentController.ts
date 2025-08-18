const { CommentService } = require('../../application/comment/CommentService');
const { CommentRepositoryImpl } = require('../../infrastructure/comment/CommentRepositoryImpl');

class CommentController {
  constructor() {
    const commentRepository = new CommentRepositoryImpl();
    this.commentService = new CommentService(commentRepository);
  }

  createComment = async (req, res) => {
    try {
      const { content, temperature_change } = req.body;
      const { postId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const comment = await this.commentService.createComment({ content, temperature_change }, postId, userId);

      res.status(201).json({
        success: true,
        message: '댓글이 작성되었습니다.',
        data: comment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getCommentById = async (req, res) => {
    try {
      const { id } = req.params;

      const comment = await this.commentService.getCommentById(id);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: '댓글을 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: comment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getCommentsByPost = async (req, res) => {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      console.log('CommentController.getCommentsByPost - params:', { postId, page, limit }); // 디버깅용

      const result = await this.commentService.getCommentsByPost(postId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('CommentController.getCommentsByPost - error:', error); // 디버깅용
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getCommentsByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.commentService.getCommentsByUser(userId, page, limit);

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

  updateComment = async (req, res) => {
    try {
      const { id } = req.params;
      const { content, temperature_change } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const comment = await this.commentService.updateComment(id, { content, temperature_change }, userId);

      res.json({
        success: true,
        message: '댓글이 수정되었습니다.',
        data: comment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  deleteComment = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.commentService.deleteComment(id, userId);

      res.json({
        success: true,
        message: '댓글이 삭제되었습니다.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  updateCommentTemperature = async (req, res) => {
    try {
      const { id } = req.params;
      const { temperature_change } = req.body;

      if (temperature_change === undefined) {
        return res.status(400).json({
          success: false,
          error: '온도 변화값을 입력해주세요.'
        });
      }

      const comment = await this.commentService.updateCommentTemperature(id, temperature_change);

      res.json({
        success: true,
        message: '댓글 온도가 업데이트되었습니다.',
        data: comment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = { CommentController };
