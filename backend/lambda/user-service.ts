import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserService } from '../src/application/user/UserService';
import { UserRepositoryImpl } from '../src/infrastructure/user/UserRepositoryImpl';
import { MyRoomService } from '../src/application/myroom/MyRoomService';
import { MyRoomRepositoryImpl } from '../src/infrastructure/myroom/MyRoomRepositoryImpl';
import jwt from 'jsonwebtoken';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// 서비스 초기화
const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);
const myRoomRepository = new MyRoomRepositoryImpl();
const myRoomService = new MyRoomService(myRoomRepository, userRepository);

// JWT 토큰 생성
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, nickname: user.nickname },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 응답 헬퍼
const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

// 인증 미들웨어
const authenticateToken = (event: APIGatewayProxyEvent) => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch {
    return null;
  }
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path, body, queryStringParameters } = event;
    
    console.log(`Request: ${httpMethod} ${path}`);
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }
    
    // 경로별 라우팅
    if (path === '/auth/register' && httpMethod === 'POST') {
      const { email, password, nickname } = JSON.parse(body || '{}');
      
      if (!email || !password || !nickname) {
        return createResponse(400, { error: '모든 필드를 입력해주세요.' });
      }
      
      const user = await userService.register(email, password, nickname);
      const token = generateToken(user);
      
      return createResponse(201, {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          temperature: user.temperature
        },
        token
      });
    }
    
    if (path === '/auth/login' && httpMethod === 'POST') {
      const { email, password } = JSON.parse(body || '{}');
      
      if (!email || !password) {
        return createResponse(400, { error: '이메일과 비밀번호를 입력해주세요.' });
      }
      
      const user = await userService.login(email, password);
      const token = generateToken(user);
      
      return createResponse(200, {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          temperature: user.temperature
        },
        token
      });
    }
    
    if (path === '/auth/check-nickname' && httpMethod === 'GET') {
      const nickname = queryStringParameters?.nickname;
      
      if (!nickname) {
        return createResponse(400, { error: '닉네임을 입력해주세요.' });
      }
      
      const isAvailable = await userService.isNicknameAvailable(nickname);
      return createResponse(200, { available: isAvailable });
    }
    
    if (path === '/temperature' && httpMethod === 'GET') {
      const user = authenticateToken(event);
      if (!user) {
        return createResponse(401, { error: '인증이 필요합니다.' });
      }
      
      const userData = await userService.getUserById(user.id);
      if (!userData) {
        return createResponse(404, { error: '사용자를 찾을 수 없습니다.' });
      }
      
      return createResponse(200, { temperature: userData.temperature });
    }
    
    // 404 처리
    return createResponse(404, { error: 'API 엔드포인트를 찾을 수 없습니다.' });
    
  } catch (error: any) {
    console.error('Error:', error);
    
    // 에러 타입별 처리
    switch (error.message) {
      case 'EMAIL_EXISTS':
        return createResponse(409, { error: '이미 존재하는 이메일입니다.' });
      case 'NICKNAME_EXISTS':
        return createResponse(409, { error: '이미 존재하는 닉네임입니다.' });
      case 'USER_NOT_FOUND':
        return createResponse(404, { error: '사용자를 찾을 수 없습니다.' });
      case 'INVALID_PASSWORD':
        return createResponse(401, { error: '비밀번호가 일치하지 않습니다.' });
      case 'WEAK_PASSWORD':
        return createResponse(400, { error: '비밀번호는 8자 이상이어야 합니다.' });
      default:
        return createResponse(500, { error: '서버 오류가 발생했습니다.' });
    }
  }
};
