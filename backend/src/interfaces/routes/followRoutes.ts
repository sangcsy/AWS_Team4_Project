import express from 'express';
import { FollowController } from '../controllers/FollowController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const followController = new FollowController();

// 팔로우/언팔로우
router.post('/', authMiddleware, followController.followUser);
router.delete('/:followingId', authMiddleware, followController.unfollowUser);

// 팔로우 목록 조회
router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);

// 팔로우 통계
router.get('/stats/:userId', followController.getFollowStats);

// 팔로우 상태 확인
router.get('/check/:followingId', authMiddleware, followController.isFollowing);

// 사용자 팔로우 정보
router.get('/info/:userId', authMiddleware, followController.getUserFollowInfo);

// 상호 팔로우 (친구 관계)
router.get('/mutual/:userId', followController.getMutualFollows);

export default router;
