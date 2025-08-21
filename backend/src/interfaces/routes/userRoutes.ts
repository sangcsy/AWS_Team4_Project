import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/authMiddleware';

export function createUserRoutes(userController: UserController) {
  const router = Router();
  router.post('/auth/register', userController.register);
  router.post('/auth/login', userController.login);
  router.get('/auth/check-nickname', userController.checkNickname);
  router.get('/temperature', authenticateJWT, userController.getMyTemperature);
  return router;
}