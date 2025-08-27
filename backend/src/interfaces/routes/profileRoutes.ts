import express from 'express';
import { ProfileController } from '../controllers/profile/ProfileController';

const router = express.Router();
const profileController = new ProfileController();

// 사용자 프로필 조회
router.get('/:userId', profileController.getProfile);

// 사용자 프로필 업데이트
router.put('/:userId', profileController.updateProfile);

// 사용자 게시글 조회
router.get('/:userId/posts', profileController.getUserPosts);

export default router;
