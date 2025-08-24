import { NotificationService } from '../../functions/auth/NotificationService';
import { NotificationRepositoryImpl } from '../../functions/auth/NotificationRepositoryImpl';

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    const notificationRepository = new NotificationRepositoryImpl();
    this.notificationService = new NotificationService(notificationRepository);
  }

  // 사용자 알림 목록 조회
  getUserNotifications = async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;
      const { limit = 20 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const notifications = await this.notificationService.getUserNotifications(userId, parseInt(limit));

      res.json({
        success: true,
        data: {
          notifications
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // 알림 읽음 처리
  markAsRead = async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.notificationService.markAsRead(notificationId);

      res.json({
        success: true,
        message: '알림을 읽음 처리했습니다.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // 모든 알림 읽음 처리
  markAllAsRead = async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: '모든 알림을 읽음 처리했습니다.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // 읽지 않은 알림 개수 조회
  getUnreadCount = async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          unreadCount: count
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

export { NotificationController };
