const express = require('express');
const cors = require('cors');
const path = require('path');
const { createTables, testConnection } = require('./shared/database');

// 실제 라우터 import
const userRoutes = require('./interfaces/routes/userRoutes');
const postRoutes = require('./interfaces/routes/postRoutes');
const commentRoutes = require('./interfaces/routes/commentRoutes');
const myroomRoutes = require('./interfaces/routes/myroomRoutes');
const followRoutes = require('./interfaces/routes/followRoutes');

// 랜덤 매칭 시스템 라우터 import
const profileRoutes = require('./interfaces/routes/profile/profileRoutes');
const matchingRoutes = require('./interfaces/routes/matching/matchingRoutes');
const chatRoutes = require('./interfaces/routes/chat/chatRoutes');

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
app.use('/api/myroom', myroomRoutes);
app.use('/api/follow', followRoutes);

// 랜덤 매칭 시스템 API 라우터
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);

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
