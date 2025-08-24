import express from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const userController = new UserController();

// 회원가입
router.post('/register', userController.register);

// 로그인
router.post('/login', userController.login);

// 닉네임 중복 확인
router.get('/check-nickname', userController.checkNickname);

// 사용자 검색 (인증 필요)
router.get('/search', authMiddleware, userController.searchUsers);

// 사용자 프로필 조회 (인증 필요)
router.get('/profile/:userId', authMiddleware, userController.getUserProfile);

export default router;
