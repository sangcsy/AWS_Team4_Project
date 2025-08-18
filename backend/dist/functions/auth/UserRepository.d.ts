import { User } from '../../shared/types';
export interface UserRepository {
    createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByNickname(nickname: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
}
//# sourceMappingURL=UserRepository.d.ts.map