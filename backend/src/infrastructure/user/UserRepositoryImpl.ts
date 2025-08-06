import { User } from '../../domain/user/User';
import { UserRepository } from '../../domain/user/UserRepository';

export class UserRepositoryImpl implements UserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.users.find(u => u.nickname === nickname) || null;
  }

  async save(user: User): Promise<void> {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    return this.users.some(u => u.nickname === nickname);
  }
}