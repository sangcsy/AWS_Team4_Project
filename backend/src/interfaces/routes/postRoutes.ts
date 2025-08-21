import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createPostRoutes(postController: PostController) {
  const router = Router();
  router.get('/posts', postController.list);
  router.post('/posts', authenticateJWT, postController.create);
  router.get('/posts/:id', postController.get);
  router.put('/posts/:id', authenticateJWT, postController.update);
  router.delete('/posts/:id', authenticateJWT, postController.delete);
  return router;
}