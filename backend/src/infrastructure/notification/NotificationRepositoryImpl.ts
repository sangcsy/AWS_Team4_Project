import { v4 as uuidv4 } from 'uuid';
import { databaseConnection } from '../../shared/database';
import { Notification, NotificationRepository, CreateNotificationRequest, NotificationListResponse } from '../../../domain/notification/Notification';

export class NotificationRepositoryImpl implements NotificationRepository {
  constructor() {
    this.initializeTable();
  }

  private async initializeTable() {
    try {
      const pool = await databaseConnection.getPool();
      
      // notifications 테이블이 존재하는지 확인하고, 없다면 생성
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          sender_id VARCHAR(36) NOT NULL,
          post_id VARCHAR(36),
          type VARCHAR(20) NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_read (is_read)
        )
      `);
      
      console.log('✅ Notifications 테이블 초기화 완료');
    } catch (error) {
      console.error('❌ Notifications 테이블 초기화 실패:', error);
    }
  }

  async create(notification: CreateNotificationRequest): Promise<Notification> {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
                        // post_id가 undefined인 경우 NULL로 처리
    const postId = notification.post_id || null;
    
    await pool.execute(
      'INSERT INTO notifications (id, user_id, sender_id, post_id, type, content, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, notification.user_id, notification.sender_id, postId, notification.type, notification.content, false, now, now]
    );

    return {
      id,
      user_id: notification.user_id,
      sender_id: notification.sender_id,
      post_id: notification.post_id,
      type: notification.type,
      content: notification.content,
      is_read: false,
      created_at: now,
      updated_at: now
    };
  }

  async findByUserId(userId: string, page = 1, limit = 20): Promise<NotificationListResponse> {
    try {
      const pool = await databaseConnection.getPool();
      const offset = (page - 1) * limit;
      
      // 전체 개수 조회
      const [countRows] = await pool.execute(
        'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
        [userId]
      );
      const total = countRows[0].total;

      // 읽지 않은 알림 개수 조회
      const [unreadRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );
      const unread_count = unreadRows[0].count;

      // 알림 목록 조회 (사용자 정보와 함께 JOIN)
      const [rows] = await pool.execute(`
        SELECT 
          n.*,
          u.nickname as sender_nickname,
          u.email as sender_email,
          p.title as post_title
        FROM notifications n
        LEFT JOIN users u ON n.sender_id = u.id
        LEFT JOIN posts p ON n.post_id = p.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ${offset}, ${limit}
      `, [userId]);

      const notifications = rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        sender_id: row.sender_id,
        post_id: row.post_id,
        type: row.type,
        content: row.content,
        is_read: Boolean(row.is_read),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        sender: {
          nickname: row.sender_nickname || '알 수 없음',
          email: row.sender_email || ''
        },
        post: row.post_title ? {
          title: row.post_title
        } : undefined
      }));

      return {
        notifications,
        total,
        unread_count
      };
    } catch (error) {
      console.error('❌ NotificationRepositoryImpl.findByUserId 에러:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const pool = await databaseConnection.getPool();
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    const pool = await databaseConnection.getPool();
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const pool = await databaseConnection.getPool();
    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  }
}
