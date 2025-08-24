import express from 'express';
import bodyParser from 'body-parser';
import { createTables } from './shared/database';
import { UserService } from './functions/auth/UserService';
import { UserRepositoryImpl } from './functions/auth/UserRepositoryImpl';

const app = express();
app.use(bodyParser.json());

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 서비스 초기화
const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);

// 사용자 검색 API 추가
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query; // 검색어
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력해주세요.'
      });
    }

    // UserService의 searchUsers 메서드 호출
    const users = await userService.searchUsers(q);

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error: any) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 검색 중 오류가 발생했습니다.'
    });
  }
});

// 데이터베이스 초기화
const initializeDatabase = async () => {
  try {
    await createTables();
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// API 엔드포인트
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    if (!email || !password || !nickname) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }
    
    const result = await userService.register(email, password, nickname);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    switch (error.message) {
      case 'EMAIL_EXISTS':
        res.status(409).json({
          success: false,
          error: '이미 존재하는 이메일입니다.'
        });
        break;
      case 'NICKNAME_EXISTS':
        res.status(409).json({
          success: false,
          error: '이미 존재하는 닉네임입니다.'
        });
        break;
      case 'WEAK_PASSWORD':
        res.status(400).json({
          success: false,
          error: '비밀번호는 8자 이상이어야 합니다.'
        });
        break;
      default:
        res.status(500).json({
          success: false,
          error: '서버 오류가 발생했습니다.'
        });
    }
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      });
    }
    
    const result = await userService.login(email, password);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    switch (error.message) {
      case 'USER_NOT_FOUND':
        res.status(404).json({
          success: false,
          error: '사용자를 찾을 수 없습니다.'
        });
        break;
      case 'INVALID_PASSWORD':
        res.status(401).json({
          success: false,
          error: '비밀번호가 일치하지 않습니다.'
        });
        break;
      default:
        res.status(500).json({
          success: false,
          error: '서버 오류가 발생했습니다.'
        });
    }
  }
});

app.get('/auth/check-nickname', async (req, res) => {
  try {
    const { nickname } = req.query;
    
    if (!nickname) {
      return res.status(400).json({
        success: false,
        error: '닉네임을 입력해주세요.'
      });
    }
    
    const isAvailable = await userService.isNicknameAvailable(nickname as string);
    res.status(200).json({
      success: true,
      data: { available: isAvailable }
    });
  } catch (error: any) {
    console.error('Check nickname error:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TEMPUS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 TEMPUS Backend server is running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`📝 API endpoints:`);
      console.log(`   POST /auth/register - 회원가입`);
      console.log(`   POST /auth/login - 로그인`);
      console.log(`   GET /auth/check-nickname?nickname=... - 닉네임 중복 확인`);
      console.log(`   GET /api/users/search?q=... - 사용자 검색`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

export default app;
