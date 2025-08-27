import { Notification, CreateNotificationRequest, NotificationListResponse } from './Notification';

export interface NotificationRepository {
  create(notification: CreateNotificationRequest): Promise<Notification>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<NotificationListResponse>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  delete(notificationId: string, userId: string): Promise<void>;
}
