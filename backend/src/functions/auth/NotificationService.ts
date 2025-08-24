import { Notification, NotificationCreateData } from '../../shared/types';
import { NotificationRepository } from './NotificationRepository';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  // 좋아요 알림 생성
  async createLikeNotification(postId: string, postOwnerId: string, likerId: string, likerNickname: string): Promise<Notification> {
    const notificationData: NotificationCreateData = {
      user_id: postOwnerId,
      type: 'like',
      title: '좋아요 알림',
      message: `${likerNickname}님이 회원님의 게시글에 좋아요를 눌렀습니다.`,
      related_post_id: postId,
      related_user_id: likerId
    };

    return await this.notificationRepository.create(notificationData);
  }

  // 댓글 알림 생성
  async createCommentNotification(postId: string, postOwnerId: string, commenterId: string, commenterNickname: string): Promise<Notification> {
    const notificationData: NotificationCreateData = {
      user_id: postOwnerId,
      type: 'comment',
      title: '댓글 알림',
      message: `${commenterNickname}님이 회원님의 게시글에 댓글을 남겼습니다.`,
      related_post_id: postId,
      related_user_id: commenterId
    };

    return await this.notificationRepository.create(notificationData);
  }

  // 팔로우 알림 생성
  async createFollowNotification(followedUserId: string, followerId: string, followerNickname: string): Promise<Notification> {
    const notificationData: NotificationCreateData = {
      user_id: followedUserId,
      type: 'follow',
      title: '팔로우 알림',
      message: `${followerNickname}님이 회원님을 팔로우하기 시작했습니다.`,
      related_user_id: followerId
    };

    return await this.notificationRepository.create(notificationData);
  }

  // 멘션 알림 생성
  async createMentionNotification(postId: string, mentionedUserId: string, mentionerId: string, mentionerNickname: string): Promise<Notification> {
    const notificationData: NotificationCreateData = {
      user_id: mentionedUserId,
      type: 'mention',
      title: '멘션 알림',
      message: `${mentionerNickname}님이 게시글에서 회원님을 언급했습니다.`,
      related_post_id: postId,
      related_user_id: mentionerId
    };

    return await this.notificationRepository.create(notificationData);
  }

  // 시스템 알림 생성
  async createSystemNotification(userId: string, title: string, message: string): Promise<Notification> {
    const notificationData: NotificationCreateData = {
      user_id: userId,
      type: 'system',
      title,
      message
    };

    return await this.notificationRepository.create(notificationData);
  }

  // 사용자 알림 목록 조회
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return await this.notificationRepository.findByUserId(userId, limit);
  }

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId);
  }

  // 모든 알림 읽음 처리
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  // 오래된 알림 삭제
  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
    await this.notificationRepository.deleteOldNotifications(userId, daysOld);
  }
}
