const { Router } = require('express');
const { UserController } = require('../controllers/UserController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();
const userController = new UserController();

// 회원가입
router.post('/register', userController.register);

// 로그인
router.post('/login', userController.login);

// 닉네임 중복 확인
router.get('/check-nickname', userController.checkNickname);

// 내 온도 조회 (인증 필요)
router.get('/temperature', authMiddleware, userController.getMyTemperature);

module.exports = router;
