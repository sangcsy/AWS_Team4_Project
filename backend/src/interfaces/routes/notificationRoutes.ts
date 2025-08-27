import express from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const notificationController = new NotificationController();

// 모든 알림 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 사용자의 알림 목록 조회
router.get('/', notificationController.getUserNotifications);

// 읽지 않은 알림 개수 조회
router.get('/unread-count', notificationController.getUnreadCount);

// 알림을 읽음으로 표시
router.put('/:id/read', notificationController.markAsRead);

// 모든 알림을 읽음으로 표시
router.put('/mark-all-read', notificationController.markAllAsRead);

// 알림 삭제
router.delete('/:id', notificationController.deleteNotification);

export default router;
