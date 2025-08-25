import { Request, Response } from 'express';
import { UserService } from '../../functions/auth/UserService';
import { UserRepositoryImpl } from '../../functions/auth/UserRepositoryImpl';
import jwt from 'jsonwebtoken';

class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = new UserRepositoryImpl();
    this.userService = new UserService(userRepository);
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, nickname } = req.body;

      if (!email || !password || !nickname) {
        return res.status(400).json({
          success: false,
          error: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.'
        });
      }

      const result = await this.userService.register(email, password, nickname);

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      const result = await this.userService.login(email, password);

      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      res.status(401).json({
        success: false,
        error: errorMessage
      });
    }
  };

  checkNickname = async (req: Request, res: Response) => {
    try {
      const { nickname } = req.params;

      if (!nickname) {
        return res.status(400).json({
          success: false,
          error: '닉네임을 입력해주세요.'
        });
      }

      const isAvailable = await this.userService.isNicknameAvailable(nickname);

      res.json({
        success: true,
        data: {
          nickname,
          isAvailable
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '닉네임 확인에 실패했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  searchUsers = async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: '검색어를 입력해주세요.'
        });
      }

      const users = await this.userService.searchUsers(q);

      res.json({
        success: true,
        data: {
          users
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '사용자 검색에 실패했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }

      const user = await this.userService.getUserProfile(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '사용자 프로필 조회에 실패했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          temperature: user.temperature,
          created_at: user.created_at
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };
}

export { UserController };
