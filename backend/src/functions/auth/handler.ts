import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createTables } from '../../shared/database';
import { UserService } from './UserService';
import { UserRepositoryImpl } from './UserRepositoryImpl';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// 서비스 초기화
const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);

// 응답 헬퍼
const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path, body } = event;
    
    console.log(`Request: ${httpMethod} ${path}`);
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }
    
    // 데이터베이스 초기화 (첫 요청 시)
    if (httpMethod === 'POST' && path === '/auth/register') {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Database initialization error:', error);
        // 데이터베이스 초기화 실패 시에도 계속 진행
      }
    }
    
    // 경로별 라우팅
    if (path === '/auth/register' && httpMethod === 'POST') {
      const { email, password, nickname } = JSON.parse(body || '{}');
      
      if (!email || !password || !nickname) {
        return createResponse(400, { 
          success: false,
          error: '모든 필드를 입력해주세요.' 
        });
      }
      
      const result = await userService.register(email, password, nickname);
      return createResponse(201, {
        success: true,
        data: result
      });
    }
    
    if (path === '/auth/login' && httpMethod === 'POST') {
      const { email, password } = JSON.parse(body || '{}');
      
      if (!email || !password) {
        return createResponse(400, { 
          success: false,
          error: '이메일과 비밀번호를 입력해주세요.' 
        });
      }
      
      const result = await userService.login(email, password);
      return createResponse(200, {
        success: true,
        data: result
      });
    }
    
    if (path === '/auth/check-nickname' && httpMethod === 'GET') {
      const nickname = event.queryStringParameters?.['nickname'];
      
      if (!nickname) {
        return createResponse(400, { 
          success: false,
          error: '닉네임을 입력해주세요.' 
        });
      }
      
      const isAvailable = await userService.isNicknameAvailable(nickname);
      return createResponse(200, { 
        success: true,
        data: { available: isAvailable } 
      });
    }
    
    // 404 처리
    return createResponse(404, { 
      success: false,
      error: 'API 엔드포인트를 찾을 수 없습니다.' 
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    
    // 에러 타입별 처리
    switch (error.message) {
      case 'EMAIL_EXISTS':
        return createResponse(409, { 
          success: false,
          error: '이미 존재하는 이메일입니다.' 
        });
      case 'NICKNAME_EXISTS':
        return createResponse(409, { 
          success: false,
          error: '이미 존재하는 닉네임입니다.' 
        });
      case 'USER_NOT_FOUND':
        return createResponse(404, { 
          success: false,
          error: '사용자를 찾을 수 없습니다.' 
        });
      case 'INVALID_PASSWORD':
        return createResponse(401, { 
          success: false,
          error: '비밀번호가 일치하지 않습니다.' 
        });
      case 'WEAK_PASSWORD':
        return createResponse(400, { 
          success: false,
          error: '비밀번호는 8자 이상이어야 합니다.' 
        });
      default:
        return createResponse(500, { 
          success: false,
          error: '서버 오류가 발생했습니다.' 
        });
    }
  }
};
