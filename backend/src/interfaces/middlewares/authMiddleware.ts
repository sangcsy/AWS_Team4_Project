import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const authHeader = req.headers.authorization;
      console.log('Auth middleware - Authorization header:', authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.log('Auth middleware - No Bearer token found');
          return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
      }
      
      const token = authHeader.substring(7);
      console.log('Auth middleware - Token:', token);
      console.log('Auth middleware - Secret:', process.env.JWT_SECRET);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('Auth middleware - Decoded token:', decoded);
      
      req.user = { userId: decoded.userId };
      console.log('Auth middleware - req.user set:', req.user); // 이 로그 추가
      
      next();
  } catch (error) {
      console.error('Auth middleware - Error:', error);
      return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
  }
};
