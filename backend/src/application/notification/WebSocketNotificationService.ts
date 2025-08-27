import { Server as SocketIOServer } from 'socket.io';
import { NotificationService } from './NotificationService';

export class WebSocketNotificationService {
  private io: SocketIOServer;
  private notificationService: NotificationService;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: SocketIOServer, notificationService: NotificationService) {
    this.io = io;
    this.notificationService = notificationService;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('🔌 새로운 클라이언트 연결:', socket.id);

      // 사용자 인증 및 소켓 등록
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          // JWT 토큰 검증 (간단한 구현)
          const userId = await this.verifyToken(data.token);
          if (userId) {
            this.userSockets.set(userId, socket.id);
            socket.data.userId = userId;
            console.log(`✅ 사용자 ${userId} 소켓 등록 완료`);
            
            // 읽지 않은 알림 개수 전송
            const unreadCount = await this.notificationService.getUnreadCount(userId);
            socket.emit('unread-count', { count: unreadCount });
          }
        } catch (error) {
          console.error('소켓 인증 실패:', error);
          socket.emit('auth-error', { message: '인증에 실패했습니다.' });
        }
      });

      // 연결 해제 처리
      socket.on('disconnect', () => {
        if (socket.data.userId) {
          this.userSockets.delete(socket.data.userId);
          console.log(`🔌 사용자 ${socket.data.userId} 소켓 연결 해제`);
        }
      });
    });
  }

  // 실시간 알림 전송
  async sendNotification(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('new-notification', notification);
      console.log(`📨 알림 전송 완료: ${userId} -> ${notification.type}`);
    } else {
      console.log(`⚠️ 사용자 ${userId}가 온라인이 아닙니다.`);
    }
  }

  // 좋아요 알림 전송
  async sendLikeNotification(postOwnerId: string, likerId: string, likerNickname: string, postId: string) {
    if (postOwnerId === likerId) return; // 자신의 게시글에는 알림 생성하지 않음

    const notification = await this.notificationService.createLikeNotification(
      postId,
      postOwnerId,
      likerId,
      likerNickname
    );

    // 실시간 알림 전송
    await this.sendNotification(postOwnerId, {
      type: 'LIKE',
      content: `${likerNickname}님이 회원님의 게시글을 좋아합니다.`,
      post_id: postId,
      sender_id: likerId,
      created_at: new Date()
    });
  }

  // 댓글 알림 전송
  async sendCommentNotification(postOwnerId: string, commenterId: string, commenterNickname: string, postId: string) {
    if (postOwnerId === commenterId) return; // 자신의 게시글에는 알림 생성하지 않음

    const notification = await this.notificationService.createCommentNotification(
      postId,
      postOwnerId,
      commenterId,
      commenterNickname
    );

    // 실시간 알림 전송
    await this.sendNotification(postOwnerId, {
      type: 'COMMENT',
      content: `${commenterNickname}님이 회원님의 게시글에 댓글을 남겼습니다.`,
      post_id: postId,
      sender_id: commenterId,
      created_at: new Date()
    });
  }

  // 팔로우 알림 전송
  async sendFollowNotification(followedUserId: string, followerId: string, followerNickname: string) {
    if (followedUserId === followerId) return; // 자신을 팔로우하는 경우 알림 생성하지 않음

    const notification = await this.notificationService.createFollowNotification(
      followedUserId,
      followerId,
      followerNickname
    );

    // 실시간 알림 전송
    await this.sendNotification(followedUserId, {
      type: 'FOLLOW',
      content: `${followerNickname}님이 회원님을 팔로우하기 시작했습니다.`,
      sender_id: followerId,
      created_at: new Date()
    });
  }

  // 읽지 않은 알림 개수 업데이트
  async updateUnreadCount(userId: string) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      this.io.to(socketId).emit('unread-count', { count: unreadCount });
    }
  }

  private async verifyToken(token: string): Promise<string | null> {
    try {
      // 간단한 JWT 검증 (실제로는 더 안전한 방법 사용)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'tempus_jwt_secret_key_2024_secure_version_fixed');
      return decoded.id || decoded.userId;
    } catch (error) {
      return null;
    }
  }
}
