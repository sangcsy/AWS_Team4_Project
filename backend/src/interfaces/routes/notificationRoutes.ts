import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const notificationController = new NotificationController();

// 모든 알림 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 사용자 알림 목록 조회
router.get('/', notificationController.getUserNotifications);

// 알림 읽음 처리
router.patch('/:notificationId/read', notificationController.markAsRead);

// 모든 알림 읽음 처리
router.patch('/read-all', notificationController.markAllAsRead);

// 읽지 않은 알림 개수 조회
router.get('/unread-count', notificationController.getUnreadCount);

export default router;
