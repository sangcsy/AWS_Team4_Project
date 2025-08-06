import { Router } from 'express';
import { MyRoomController } from '../controllers/MyRoomController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createMyRoomRoutes(myRoomController: MyRoomController) {
  const router = Router();
  router.get('/myroom/:nickname', authenticateJWT, myRoomController.get);
  router.put('/myroom/:nickname', authenticateJWT, myRoomController.update);
  return router;
}