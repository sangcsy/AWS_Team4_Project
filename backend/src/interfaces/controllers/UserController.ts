import { Request, Response } from 'express';
import { UserService } from '../../application/user/UserService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, nickname } = req.body;
      const user = await this.userService.register(email, password, nickname);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { nickname: user.nickname, email: user.email, temperature: user.temperature } });
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
      if (err.message === 'NICKNAME_EXISTS') return res.status(409).json({ error: '이미 사용 중인 닉네임입니다.' });
      if (err.message === 'WEAK_PASSWORD') return res.status(400).json({ error: '비밀번호가 너무 약합니다.' });
      res.status(500).json({ error: '회원가입 실패' });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.userService.login(email, password);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ token, user: { nickname: user.nickname, email: user.email, temperature: user.temperature } });
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND' || err.message === 'INVALID_PASSWORD') return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      res.status(500).json({ error: '로그인 실패' });
    }
  };

  checkNickname = async (req: Request, res: Response) => {
    const { nickname } = req.query;
    if (typeof nickname !== 'string') return res.status(400).json({ error: '닉네임이 필요합니다.' });
    const available = await this.userService.isNicknameAvailable(nickname);
    res.json({ available });
  };

  getMyTemperature = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const userObj = await this.userService.getUserById(user.userId);
    if (!userObj) return res.status(404).json({ error: '유저 없음' });
    res.json({ temperature: userObj.temperature });
  };
}