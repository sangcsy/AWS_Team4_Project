import express from 'express';
import cors from 'cors';
import path from 'path';
import { createTables, testConnection } from './shared/database';
import userRoutes from './interfaces/routes/userRoutes';
import postRoutes from './interfaces/routes/postRoutes';
import commentRoutes from './interfaces/routes/commentRoutes';
import myRoomRoutes from './interfaces/routes/myRoomRoutes';
import followRoutes from './interfaces/routes/followRoutes';
import notificationRoutes from './interfaces/routes/notificationRoutes';
// import profileRoutes from './interfaces/routes/profileRoutes';
// import matchingRoutes from './interfaces/routes/matchingRoutes';
// import chatRoutes from './interfaces/routes/chatRoutes';

const app = express();
const PORT = process.env['PORT'] || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (테스트 페이지용)
app.use(express.static(path.join(__dirname, '..')));

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'TEMPUS API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 테스트 페이지
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test.html'));
});

// 데이터베이스 상태 확인
app.get('/api/health/db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      success: true,
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 실제 API 라우터 사용
app.use('/api/auth', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api/myroom', myRoomRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);

// Mock API 엔드포인트들
app.get('/api/posts', (req, res) => {
  // Mock 게시글 데이터
  const mockPosts = [
    {
      id: 'post_1',
      user_id: 'user_1',
      title: '안녕하세요!',
      content: '첫 번째 게시글입니다.',
      category: '자유',
      temperature_change: 0,
      likes: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        nickname: '테스트유저',
        temperature: 36.5,
        email: 'test@example.com'
      }
    }
  ];
  
  res.json({
    success: true,
    data: {
      posts: mockPosts
    }
  });
});

app.get('/api/follow/following/:userId', (req, res) => {
  const { userId } = req.params;
  if (userId === 'undefined') {
    return res.status(400).json({
      success: false,
      error: '사용자 ID가 필요합니다.'
    });
  }
  
  // Mock 팔로잉 데이터
  res.json({
    success: true,
    data: {
      following: []
    }
  });
});

app.get('/api/follow/followers/:userId', (req, res) => {
  const { userId } = req.params;
  if (userId === 'undefined') {
    return res.status(400).json({
      success: false,
      error: '사용자 ID가 필요합니다.'
    });
  }
  
  // Mock 팔로워 데이터
  res.json({
    success: true,
    data: {
      followers: []
    }
  });
});

app.post('/api/follow', (req, res) => {
  // Mock 팔로우 성공
  res.json({
    success: true,
    message: '팔로우 성공'
  });
});

app.delete('/api/follow/:followingId', (req, res) => {
  // Mock 언팔로우 성공
  res.json({
    success: true,
    message: '언팔로우 성공'
  });
});

app.get('/api/follow/check/:followingId', (req, res) => {
  // Mock 팔로우 상태 확인
  res.json({
    success: true,
    data: {
      isFollowing: false
    }
  });
});

// Mock 사용자 프로필 API 추가
app.get('/api/users/profile/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: '사용자 ID가 필요합니다.'
    });
  }

  // Mock 사용자 프로필 데이터
  const mockProfile = {
    user: {
      id: userId,
      email: 'test@example.com',
      nickname: '테스트유저',
      temperature: 36.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    stats: {
      total_posts: 1,
      total_likes: 5,
      total_followers: 0,
      total_following: 0
    }
  };

  res.json({
    success: true,
    data: mockProfile
  });
});

// Mock 사용자 게시글 API 추가
app.get('/api/posts/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: '사용자 ID가 필요합니다.'
    });
  }

  // Mock 사용자 게시글 데이터
  const mockUserPosts = [
    {
      id: 'post_1',
      user_id: userId,
      title: '안녕하세요!',
      content: '첫 번째 게시글입니다.',
      category: '자유',
      temperature_change: 0,
      likes: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        nickname: '테스트유저',
        temperature: 36.5,
        email: 'test@example.com'
      }
    }
  ];

  res.json({
    success: true,
    data: {
      posts: mockUserPosts
    }
  });
});

// 랜덤 매칭 시스템 API 라우터
// app.use('/api/profile', profileRoutes);
// app.use('/api/matching', matchingRoutes);
// app.use('/api/chat', chatRoutes);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API 엔드포인트를 찾을 수 없습니다.'
  });
});

// Lambda 핸들러 (serverless용)
const serverless = require('serverless-http');

// Lambda 환경에서 Express 앱을 래핑
const serverlessHandler = serverless(app);

exports.handler = async (event, context) => {
  try {
    // Lambda 환경에서 데이터베이스 연결 확인
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.log('🔌 Lambda 환경에서 데이터베이스 연결 확인...');
      await createTables();
      console.log('✅ Lambda 환경 데이터베이스 연결 완료');
    }
    
    // serverless-http로 Express 앱 실행
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('❌ Lambda 핸들러 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Lambda 핸들러 오류',
        message: error.message
      })
    };
  }
};

// Express 앱 시작 (항상 실행)
const startServer = async () => {
  try {
    // 데이터베이스 연결 및 테이블 생성
    console.log('🔌 Connecting to database...');
    await createTables();
    console.log('✅ Database setup completed');
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 Real APIs available at:`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/auth/check-nickname`);
      console.log(`   GET  /api/auth/temperature`);
      console.log(`   POST /api/posts`);
      console.log(`   GET  /api/posts`);
      console.log(`   GET  /api/posts/:id`);
      console.log(`   POST /api/posts/:postId/comments`);
      console.log(`   GET  /api/posts/:postId/comments`);
      console.log(`   GET  /api/comments/:id`);
      console.log(`   GET  /api/health/db`);
      console.log(`   POST /api/myroom`);
      console.log(`   GET  /api/myroom`);
      console.log(`   PATCH /api/myroom/temperature`);
      console.log(`   POST /api/myroom/items`);
      console.log(`   GET  /api/myroom/items`);
      console.log(`   POST /api/follow`);
      console.log(`   GET  /api/follow/followers/:userId`);
      console.log(`   GET  /api/follow/following/:userId`);
      console.log(`   GET  /api/follow/stats/:userId`);
      console.log(`🌐 Test page: http://localhost:${PORT}/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
