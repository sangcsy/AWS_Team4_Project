import { User, AuthResponse } from '../../shared/types';
import { UserRepository } from './UserRepository';
export declare class UserService {
    private userRepository;
    constructor(userRepository: UserRepository);
    register(email: string, password: string, nickname: string): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    isNicknameAvailable(nickname: string): Promise<boolean>;
    getUserById(id: string): Promise<User | null>;
    private generateToken;
}
//# sourceMappingURL=UserService.d.ts.map