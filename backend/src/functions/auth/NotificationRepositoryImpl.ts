import { Notification, NotificationCreateData } from '../../shared/types';
import { NotificationRepository } from './NotificationRepository';
import { DatabaseConnection } from '../../shared/database';

export class NotificationRepositoryImpl implements NotificationRepository {
  private db = DatabaseConnection.getInstance();

  async create(notificationData: NotificationCreateData): Promise<Notification> {
    const id = this.generateId();
    const now = new Date();
    
    const notification: Notification = {
      ...notificationData,
      id,
      is_read: false,
      created_at: now
    };

    const sql = `
      INSERT INTO notifications (id, user_id, type, title, message, related_post_id, related_user_id, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const pool = await this.db.getPool();
    await pool.execute(sql, [
      notification.id,
      notification.user_id,
      notification.type,
      notification.title,
      notification.message,
      notification.related_post_id || null,
      notification.related_user_id || null,
      notification.is_read,
      notification.created_at
    ]);

    return notification;
  }

  async findByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    const pool = await this.db.getPool();
    const [rows] = await pool.execute(sql, [userId, limit]) as [any[], any];
    return rows as Notification[];
  }

  async markAsRead(notificationId: string): Promise<void> {
    const sql = 'UPDATE notifications SET is_read = true WHERE id = ?';
    const pool = await this.db.getPool();
    await pool.execute(sql, [notificationId]);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const sql = 'UPDATE notifications SET is_read = true WHERE user_id = ?';
    const pool = await this.db.getPool();
    await pool.execute(sql, [userId]);
  }

  async deleteOldNotifications(userId: string, daysOld: number): Promise<void> {
    const sql = `
      DELETE FROM notifications 
      WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const pool = await this.db.getPool();
    await pool.execute(sql, [userId, daysOld]);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false';
    const pool = await this.db.getPool();
    const [rows] = await pool.execute(sql, [userId]) as [any[], any];
    return rows[0]?.count || 0;
  }

  private generateId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
