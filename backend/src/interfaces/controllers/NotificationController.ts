import { NotificationService } from '../../application/notification/NotificationService';
import { NotificationRepositoryImpl } from '../../infrastructure/notification/NotificationRepositoryImpl';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    const notificationRepository = new NotificationRepositoryImpl();
    this.notificationService = new NotificationService(notificationRepository);
  }

                // 사용자의 알림 목록 조회
              getUserNotifications = async (req: any, res: any) => {
                try {
                  const userId = req.user?.userId;
                  const page = parseInt(req.query.page) || 1;
                  const limit = parseInt(req.query.limit) || 20;
            
                  console.log('🔍 NotificationController.getUserNotifications 호출:', { userId, page, limit });
            
                  if (!userId) {
                    return res.status(401).json({
                      success: false,
                      error: '인증이 필요합니다.'
                    });
                  }
            
                  const result = await this.notificationService.getUserNotifications(userId, page, limit);
                  
                  console.log('✅ 알림 조회 결과:', {
                    total: result.total,
                    unread_count: result.unread_count,
                    notifications_count: result.notifications.length
                  });
            
                  res.json({
                    success: true,
                    data: result
                  });
                } catch (error) {
                  console.error('❌ 알림 조회 실패:', error);
                  res.status(500).json({
                    success: false,
                    error: '알림을 가져오는데 실패했습니다.'
                  });
                }
              };

  // 알림을 읽음으로 표시
  markAsRead = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.notificationService.markNotificationAsRead(id);

      res.json({
        success: true,
        message: '알림이 읽음으로 표시되었습니다.'
      });
    } catch (error) {
      console.error('알림 읽음 표시 실패:', error);
      res.status(500).json({
        success: false,
        error: '알림 상태를 업데이트하는데 실패했습니다.'
      });
    }
  };

  // 모든 알림을 읽음으로 표시
  markAllAsRead = async (req: any, res: any) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.notificationService.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        message: '모든 알림이 읽음으로 표시되었습니다.'
      });
    } catch (error) {
      console.error('모든 알림 읽음 표시 실패:', error);
      res.status(500).json({
        success: false,
        error: '알림 상태를 업데이트하는데 실패했습니다.'
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
        data: { unread_count: count }
      });
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '알림 개수를 가져오는데 실패했습니다.'
      });
    }
  };

  // 알림 삭제
  deleteNotification = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: '알림이 삭제되었습니다.'
      });
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      res.status(500).json({
        success: false,
        error: '알림을 삭제하는데 실패했습니다.'
      });
    }
  };
}
