import { Notification, NotificationCreateData } from '../../shared/types';

export interface NotificationRepository {
  create(notificationData: NotificationCreateData): Promise<Notification>;
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteOldNotifications(userId: string, daysOld: number): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
