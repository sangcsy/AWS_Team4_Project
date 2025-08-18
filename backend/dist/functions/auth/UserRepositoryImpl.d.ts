import { User } from '../../shared/types';
import { UserRepository } from './UserRepository';
export declare class UserRepositoryImpl implements UserRepository {
    private db;
    createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByNickname(nickname: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    private generateId;
}
//# sourceMappingURL=UserRepositoryImpl.d.ts.map