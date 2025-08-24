const { UserService } = require('../../application/user/UserService');
const { UserRepositoryImpl } = require('../../infrastructure/user/UserRepositoryImpl');
const jwt = require('jsonwebtoken');

class UserController {
  constructor() {
    const userRepository = new UserRepositoryImpl();
    this.userService = new UserService(userRepository);
  }

  register = async (req, res) => {
    try {
      const { email, password, nickname } = req.body;

      // 입력 검증
      if (!email || !password || !nickname) {
        return res.status(400).json({
          success: false,
          error: '이메일, 비밀번호, 닉네임을 모두 입력해주세요.'
        });
      }

      const user = await this.userService.register({ email, password, nickname });
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env['JWT_SECRET'] || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // 입력 검증
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.'
        });
      }

      const user = await this.userService.login({ email, password });
      
      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env['JWT_SECRET'] || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  };

  checkNickname = async (req, res) => {
    try {
      const { nickname } = req.query;

      if (!nickname || typeof nickname !== 'string') {
        return res.status(400).json({
          success: false,
          error: '닉네임을 입력해주세요.'
        });
      }

      const isAvailable = await this.userService.checkNickname(nickname);

      res.json({
        success: true,
        data: {
          nickname,
          isAvailable
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getMyTemperature = async (req, res) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const temperature = await this.userService.getMyTemperature(userId);

      res.json({
        success: true,
        data: {
          temperature
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // 사용자 검색 메서드 추가
  searchUsers = async (req, res) => {
    try {
      const { q } = req.query; // 검색어
      
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = { UserController };
