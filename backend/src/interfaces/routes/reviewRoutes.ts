import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createReviewRoutes(reviewController: ReviewController) {
  const router = Router();
  router.post('/market/:itemId/review', authenticateJWT, reviewController.create);
  router.get('/market/:itemId/review', authenticateJWT, reviewController.list);
  return router;
}