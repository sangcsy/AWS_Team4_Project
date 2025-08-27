import express from 'express';
import { MyRoomController } from '../controllers/MyRoomController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const myRoomController = new MyRoomController();

// 마이룸 CRUD
router.post('/', authMiddleware, myRoomController.createMyRoom);
router.get('/', authMiddleware, myRoomController.getMyRoom);
router.put('/', authMiddleware, myRoomController.updateMyRoom);
router.delete('/', authMiddleware, myRoomController.deleteMyRoom);

// 온도 관리
router.patch('/temperature', authMiddleware, myRoomController.updateTemperature);

// 아이템 관리
router.post('/items', authMiddleware, myRoomController.addItem);
router.get('/items', authMiddleware, myRoomController.getItems);
router.delete('/items/:itemId', authMiddleware, myRoomController.removeItem);

export default router;
