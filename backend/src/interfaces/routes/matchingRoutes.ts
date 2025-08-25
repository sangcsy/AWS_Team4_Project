import express from 'express';
import { MatchingController } from '../controllers/matching/MatchingController';

const router = express.Router();
const matchingController = new MatchingController();

// 매칭 요청
router.post('/request', matchingController.requestMatching);

// 매칭 상태 확인
router.get('/status/:matchingId', matchingController.getMatchingStatus);

// 매칭 종료
router.post('/:matchingId/end', matchingController.endMatching);

// 매칭 히스토리 조회
router.get('/history/:userId', matchingController.getMatchingHistory);

export default router;
