import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createCommentRoutes(commentController: CommentController) {
  const router = Router();
  router.post('/posts/:postId/comments', authenticateJWT, commentController.create);
  router.delete('/comments/:id', authenticateJWT, commentController.delete);
  router.get('/posts/:postId/comments', commentController.listByPost);
  return router;
}