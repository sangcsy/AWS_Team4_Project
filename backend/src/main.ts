import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createTables, testConnection } from './shared/database';
import userRoutes from './interfaces/routes/userRoutes';
import postRoutes from './interfaces/routes/postRoutes';
import commentRoutes from './interfaces/routes/commentRoutes';
import myRoomRoutes from './interfaces/routes/myRoomRoutes';
import followRoutes from './interfaces/routes/followRoutes';
import notificationRoutes from './interfaces/routes/notificationRoutes';
import { errorHandler, notFoundHandler } from './interfaces/middlewares/errorHandler';
import profileRoutes from './interfaces/routes/profileRoutes';
import matchingRoutes from './interfaces/routes/matchingRoutes';
import chatRoutes from './interfaces/routes/chatRoutes';
import { WebSocketNotificationService } from './application/notification/WebSocketNotificationService';
import { NotificationService } from './application/notification/NotificationService';
import { NotificationRepositoryImpl } from './infrastructure/notification/NotificationRepositoryImpl';

// JWT_SECRET 설정 (환경변수가 없으면 기본값 사용)
if (!process.env['JWT_SECRET']) {
  process.env['JWT_SECRET'] = 'tempus_jwt_secret_key_2024_secure_version_fixed';
  console.log('⚠️ JWT_SECRET 환경변수가 설정되지 않아 기본값을 사용합니다.');
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

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
    await testConnection();
    res.json({
      success: true,
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 데이터베이스 오류';
    res.status(500).json({
      success: false,
      database: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// 실제 API 라우터 사용
app.use('/api/users', userRoutes); // /api/auth에서 /api/users로 변경
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api/myroom', myRoomRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);

// 랜덤 매칭 시스템 API 라우터 활성화
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);

// 404 핸들러 (존재하지 않는 API 엔드포인트)
app.use('/api/*', notFoundHandler);

// 전역 에러 핸들링 미들웨어 (반드시 마지막에 위치)
app.use(errorHandler);

// Mock API 제거 - 실제 API 라우터 사용

// WebSocket 알림 서비스 초기화
const notificationRepository = new NotificationRepositoryImpl();
const notificationService = new NotificationService(notificationRepository);
const webSocketNotificationService = new WebSocketNotificationService(io, notificationService);

// Socket.io 연결 처리
io.on('connection', (socket: any) => {
  console.log('🔌 새로운 클라이언트 연결:', socket.id);
  
  // 사용자 인증 및 매칭 대기열 등록
  socket.on('join-matching', (userData: any) => {
    console.log('🎯 사용자 매칭 대기열 등록:', userData);
    socket.join('matching-queue');
    socket.emit('matching-joined', { message: '매칭 대기열에 등록되었습니다.' });
  });
  
  // 매칭 요청
  socket.on('request-matching', (userData: any) => {
    console.log('🔍 매칭 요청:', userData);
    // TODO: 실제 매칭 로직 구현
    socket.emit('matching-requested', { message: '매칭을 찾고 있습니다...' });
  });
  
  // 채팅 메시지 전송
  socket.on('send-message', (messageData: any) => {
    console.log('💬 메시지 전송:', messageData);
    // TODO: 실제 채팅 로직 구현
    socket.broadcast.to(messageData.roomId).emit('receive-message', messageData);
  });
  
  // 연결 해제
  socket.on('disconnect', () => {
    console.log('🔌 클라이언트 연결 해제:', socket.id);
  });
});

// Express 앱 시작 (항상 실행)
const startServer = async () => {
  try {
    // 데이터베이스 연결 및 테이블 생성
    console.log('🔌 Connecting to database...');
    await createTables();
    console.log('✅ Database setup completed');
    
    // 서버 시작 (HTTP + WebSocket)
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔌 WebSocket server is ready`);
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
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('❌ 서버 시작 실패:', errorMessage);
    process.exit(1);
  }
};

startServer();

module.exports = app;
