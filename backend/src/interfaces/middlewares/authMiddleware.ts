import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader); // 디버깅용
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No valid authorization header'); // 디버깅용
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다.'
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    const secret = process.env['JWT_SECRET'] || 'your_jwt_secret';
    console.log('Auth middleware - Token:', token.substring(0, 20) + '...'); // 디버깅용
    console.log('Auth middleware - Secret:', secret); // 디버깅용
    
    const decoded = jwt.verify(token, secret) as any;
    console.log('Auth middleware - Decoded token:', decoded); // 디버깅용
    
    // req.user에 사용자 정보 추가
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      nickname: decoded.nickname
    };
    
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었습니다.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};
