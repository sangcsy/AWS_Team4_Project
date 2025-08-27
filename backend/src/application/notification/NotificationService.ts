import { NotificationRepository } from '../../domain/notification/NotificationRepository';
import { CreateNotificationRequest, NotificationResponse, NotificationListResponse, NotificationType } from '../../domain/notification/Notification';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async createNotification(notification: CreateNotificationRequest): Promise<NotificationResponse> {
    const createdNotification = await this.notificationRepository.create(notification);
    return this.toNotificationResponse(createdNotification);
  }

  async createLikeNotification(postId: string, postOwnerId: string, likerId: string, likerNickname: string): Promise<void> {
    // 자신의 게시글에는 알림 생성하지 않음
    if (postOwnerId === likerId) return;

    await this.notificationRepository.create({
      user_id: postOwnerId,
      sender_id: likerId,
      post_id: postId,
      type: NotificationType.LIKE,
      content: `${likerNickname}님이 회원님의 게시글을 좋아합니다.`
    });
  }

  async createCommentNotification(postId: string, postOwnerId: string, commenterId: string, commenterNickname: string): Promise<void> {
    // 자신의 게시글에는 알림 생성하지 않음
    if (postOwnerId === commenterId) return;

    await this.notificationRepository.create({
      user_id: postOwnerId,
      sender_id: commenterId,
      post_id: postId,
      type: NotificationType.COMMENT,
      content: `${commenterNickname}님이 회원님의 게시글에 댓글을 남겼습니다.`
    });
  }

  async createFollowNotification(followedUserId: string, followerId: string, followerNickname: string): Promise<void> {
    // 자신을 팔로우하는 경우 알림 생성하지 않음
    if (followedUserId === followerId) return;

    await this.notificationRepository.create({
      user_id: followedUserId,
      sender_id: followerId,
      type: NotificationType.FOLLOW,
      content: `${followerNickname}님이 회원님을 팔로우합니다.`
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 20): Promise<NotificationListResponse> {
    const result = await this.notificationRepository.findByUserId(userId, page, limit);
    
    return {
      ...result,
      notifications: result.notifications.map(notification => this.toNotificationResponse(notification))
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId, userId);
  }

  private toNotificationResponse(notification: any): NotificationResponse {
    return {
      id: notification.id,
      user_id: notification.user_id,
      sender_id: notification.sender_id,
      post_id: notification.post_id,
      type: notification.type,
      content: notification.content,
      is_read: notification.is_read,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      sender: notification.sender,
      post: notification.post
    };
  }
}
