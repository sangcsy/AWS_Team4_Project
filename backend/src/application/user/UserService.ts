import { User } from '../../domain/user/User';
import { UserRepository } from '../../domain/user/UserRepository';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(email: string, password: string, nickname: string): Promise<User> {
    // 이메일, 닉네임 중복 체크
    const existsEmail = await this.userRepository.findByEmail(email);
    if (existsEmail) throw new Error('EMAIL_EXISTS');
    const existsNickname = await this.userRepository.existsByNickname(nickname);
    if (existsNickname) throw new Error('NICKNAME_EXISTS');
    // 비밀번호 유효성 검사(간단 예시)
    if (!password || password.length < 8) throw new Error('WEAK_PASSWORD');
    // 해시
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      id: uuidv4(),
      email,
      passwordHash,
      nickname,
      temperature: 36.5,
      createdAt: new Date(),
    });
    await this.userRepository.save(user);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('USER_NOT_FOUND');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('INVALID_PASSWORD');
    return user;
  }

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    return !(await this.userRepository.existsByNickname(nickname));
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}