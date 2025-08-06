import { Router } from 'express';
import { FollowController } from '../controllers/FollowController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createFollowRoutes(followController: FollowController) {
  const router = Router();
  router.post('/follow/:nickname', authenticateJWT, followController.follow);
  router.delete('/follow/:nickname', authenticateJWT, followController.unfollow);
  router.get('/feed', authenticateJWT, followController.feed);
  return router;
}