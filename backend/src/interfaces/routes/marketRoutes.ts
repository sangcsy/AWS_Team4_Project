import { Router } from 'express';
import { MarketController } from '../controllers/MarketController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createMarketRoutes(marketController: MarketController) {
  const router = Router();
  router.post('/market', authenticateJWT, marketController.create);
  router.get('/market', authenticateJWT, marketController.list);
  router.get('/market/:id', authenticateJWT, marketController.get);
  return router;
}