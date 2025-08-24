import { User } from '../../shared/types';
import { UserRepository } from './UserRepository';
import DatabaseConnection from '../../shared/database';

export class UserRepositoryImpl implements UserRepository {
  private db = DatabaseConnection.getInstance();

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = this.generateId();
    const now = new Date();
    
    const user: User = {
      ...userData,
      id,
      created_at: now,
      updated_at: now
    };

    const sql = `
      INSERT INTO users (id, email, password_hash, nickname, temperature, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.query(sql, [
      user.id,
      user.email,
      user.password_hash,
      user.nickname,
      user.temperature,
      user.created_at,
      user.updated_at
    ]);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await this.db.query<User>(sql, [email]);
    return users.length > 0 ? users[0] : null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE nickname = ?';
    const users = await this.db.query<User>(sql, [nickname]);
    return users.length > 0 ? users[0] : null;
  }

  // 사용자 검색 메서드 구현
  async searchByNickname(searchQuery: string): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE nickname LIKE ? ORDER BY nickname LIMIT 20';
    const users = await this.db.query<User>(sql, [`%${searchQuery}%`]);
    return users;
  }

  async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = await this.db.query<User>(sql, [id]);
    return users.length > 0 ? users[0] : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateFields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = ? WHERE id = ?`;
    const values = [...Object.values(updates).filter((_, index) => index !== 0), new Date(), id];
    
    await this.db.query(sql, values);
    
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
