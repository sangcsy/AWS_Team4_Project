const { Router } = require('express');
const { MatchingController } = require('../../controllers/matching/MatchingController');
const { MatchingService } = require('../../../application/matching/MatchingService');
const { MatchingRepositoryImpl } = require('../../../infrastructure/matching/MatchingRepositoryImpl');
const { ProfileService } = require('../../../application/profile/ProfileService');
const { ProfileRepositoryImpl } = require('../../../infrastructure/profile/ProfileRepositoryImpl');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = Router();

// 의존성 주입
const profileRepository = new ProfileRepositoryImpl();
const profileService = new ProfileService(profileRepository);
const matchingRepository = new MatchingRepositoryImpl();
const matchingService = new MatchingService(matchingRepository, profileService);
const matchingController = new MatchingController(matchingService);

// 매칭 선호도 생성 (POST /api/matching/preference)
router.post('/preference', authMiddleware, (req, res) => matchingController.createMatchingPreference(req, res));

// 매칭 선호도 조회 (GET /api/matching/preference)
router.get('/preference', authMiddleware, (req, res) => matchingController.getMatchingPreference(req, res));

// 매칭 선호도 수정 (PUT /api/matching/preference)
router.put('/preference', authMiddleware, (req, res) => matchingController.updateMatchingPreference(req, res));

// 매칭 선호도 삭제 (DELETE /api/matching/preference)
router.delete('/preference', authMiddleware, (req, res) => matchingController.deleteMatchingPreference(req, res));

// 매칭 활성화 (POST /api/matching/activate)
router.post('/activate', authMiddleware, (req, res) => matchingController.activateMatching(req, res));

// 매칭 비활성화 (POST /api/matching/deactivate)
router.post('/deactivate', authMiddleware, (req, res) => matchingController.deactivateMatching(req, res));

// 랜덤 매칭 실행 (POST /api/matching/random)
router.post('/random', authMiddleware, (req, res) => matchingController.executeRandomMatching(req, res));

// 온도 기반 매칭 실행 (POST /api/matching/tempus)
router.post('/tempus', authMiddleware, (req, res) => matchingController.executeTempusBasedMatching(req, res));

// 내 활성 매칭 조회 (GET /api/matching/active)
router.get('/active', authMiddleware, (req, res) => matchingController.getMyActiveMatchings(req, res));

// 매칭 상태 업데이트 (PUT /api/matching/:matchingId/status)
router.put('/:matchingId/status', authMiddleware, (req, res) => matchingController.updateMatchingStatus(req, res));

// 매칭 삭제 (DELETE /api/matching/:matchingId)
router.delete('/:matchingId', authMiddleware, (req, res) => matchingController.deleteMatching(req, res));

module.exports = router;
