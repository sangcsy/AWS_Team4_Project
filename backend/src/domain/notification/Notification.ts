export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MENTION = 'mention'
}

export interface Notification {
  id: string;
  user_id: string; // 알림을 받을 사용자
  sender_id: string; // 알림을 발생시킨 사용자
  post_id?: string; // 관련 게시글 (좋아요, 댓글의 경우)
  type: NotificationType;
  content: string; // 알림 내용
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationRequest {
  user_id: string;
  sender_id: string;
  post_id?: string;
  type: NotificationType;
  content: string;
}

export interface NotificationResponse {
  id: string;
  user_id: string;
  sender_id: string;
  post_id?: string;
  type: NotificationType;
  content: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  sender?: {
    nickname: string;
    email: string;
  };
  post?: {
    title: string;
  };
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unread_count: number;
}
