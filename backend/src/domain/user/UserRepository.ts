import { User } from './User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  save(user: User): Promise<void>;
  existsByNickname(nickname: string): Promise<boolean>;
}