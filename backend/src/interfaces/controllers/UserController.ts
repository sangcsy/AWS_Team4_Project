import { UserService } from '../../functions/auth/UserService';
import { UserRepositoryImpl } from '../../functions/auth/UserRepositoryImpl';
import jwt from 'jsonwebtoken';

class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = new UserRepositoryImpl();
    this.userService = new UserService(userRepository);
  }

  register = async (req: any, res: any) => {
    try {
      const { email, password, nickname } = req.body;

      // 입력 검증
      if (!email || !password || !nickname) {
        return res.status(400).json({
          success: false,
          error: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.'
        });
      }

      const authResponse = await this.userService.register(email, password, nickname);
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: authResponse.user.id, email: authResponse.user.email },
        process.env['JWT_SECRET'] || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user: authResponse.user,
          token
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  login = async (req: any, res: any) => {
    try {
      const { email, password } = req.body;

      // 입력 검증
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      const authResponse = await this.userService.login(email, password);
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: authResponse.user.id, email: authResponse.user.email },
        process.env['JWT_SECRET'] || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          user: authResponse.user,
          token
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  };

  checkNickname = async (req: any, res: any) => {
    try {
      const { nickname } = req.query;

      if (!nickname || typeof nickname !== 'string') {
        return res.status(400).json({
          success: false,
          error: '닉네임을 입력해주세요.'
        });
      }

      const isAvailable = await this.userService.isNicknameAvailable(nickname);

      res.json({
        success: true,
        data: {
          isAvailable
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  // 사용자 검색 메서드 추가
  searchUsers = async (req: any, res: any) => {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // 사용자 프로필 조회 메서드 추가
  getUserProfile = async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }

      const profile = await this.userService.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

export { UserController };
