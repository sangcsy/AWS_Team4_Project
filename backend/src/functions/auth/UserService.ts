import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuthResponse } from '../../shared/types';
import { UserRepository } from './UserRepository';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(email: string, password: string, nickname: string): Promise<AuthResponse> {
    // 입력 검증
    if (password.length < 8) {
      throw new Error('WEAK_PASSWORD');
    }

    // 이메일 중복 확인
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('EMAIL_EXISTS');
    }

    // 닉네임 중복 확인
    const existingUserByNickname = await this.userRepository.findByNickname(nickname);
    if (existingUserByNickname) {
      throw new Error('NICKNAME_EXISTS');
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await this.userRepository.createUser({
      email,
      password_hash: passwordHash,
      nickname,
      temperature: 36.5
    });

    // JWT 토큰 생성
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        temperature: user.temperature,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // 사용자 찾기
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD');
    }

    // JWT 토큰 생성
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        temperature: user.temperature,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    };
  }

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByNickname(nickname);
    return !existingUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  // 사용자 검색 메서드 추가
  async searchUsers(searchQuery: string): Promise<User[]> {
    const users = await this.userRepository.searchByNickname(searchQuery);
    return users;
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname
    };

    const secret = process.env['JWT_SECRET'] || 'dev-secret';
    const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';

    return jwt.sign(payload, secret, {
      expiresIn: expiresIn
    });
  }
}
