import { User, CreateUserRequest, UpdateUserRequest } from './User';

export interface UserRepository {
  create(userData: CreateUserRequest): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  update(id: string, updates: UpdateUserRequest): Promise<User>;
  delete(id: string): Promise<void>;
  updateTemperature(id: string, temperatureChange: number): Promise<User>;
}
