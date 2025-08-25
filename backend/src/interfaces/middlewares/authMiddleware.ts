import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const authHeader = req.headers.authorization;
      console.log('🔐 Auth middleware - Authorization header:', authHeader);
      console.log('🔐 Auth middleware - All headers:', req.headers);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.log('❌ Auth middleware - No Bearer token found');
          return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      }
      
      const token = authHeader.substring(7);
      console.log('🔑 Auth middleware - Token (first 20 chars):', token.substring(0, 20) + '...');
      console.log('🔑 Auth middleware - JWT_SECRET:', process.env['JWT_SECRET']);
      
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
      console.log('✅ Auth middleware - Decoded token:', decoded);
      console.log('✅ Auth middleware - Decoded id:', decoded.id);
      console.log('✅ Auth middleware - Decoded userId:', decoded.userId);
      
      // JWT 토큰의 'id' 필드를 'userId'로 매핑
      const userId = decoded.id || decoded.userId;
      console.log('✅ Auth middleware - Mapped userId:', userId);
      
      req.user = { userId };
      console.log('✅ Auth middleware - req.user set:', req.user);
      console.log('✅ Auth middleware - req.user.userId:', req.user.userId);
      
      next();
  } catch (error) {
      console.error('💥 Auth middleware - Error:', error);
      console.error('💥 Auth middleware - Error type:', typeof error);
      console.error('💥 Auth middleware - Error message:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
  }
};
