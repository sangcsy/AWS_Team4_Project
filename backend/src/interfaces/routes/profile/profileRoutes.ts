const { Router } = require('express');
const { ProfileController } = require('../../controllers/profile/ProfileController');
const { ProfileService } = require('../../../application/profile/ProfileService');
const { ProfileRepositoryImpl } = require('../../../infrastructure/profile/ProfileRepositoryImpl');
const { authMiddleware } = require('../../middlewares/authMiddleware');

const router = Router();

// 의존성 주입
const profileRepository = new ProfileRepositoryImpl();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

// 프로필 생성 (POST /api/profile)
router.post('/', authMiddleware, (req, res) => profileController.createProfile(req, res));

// 내 프로필 조회 (GET /api/profile)
router.get('/', authMiddleware, (req, res) => profileController.getProfile(req, res));

// 프로필 수정 (PUT /api/profile)
router.put('/', authMiddleware, (req, res) => profileController.updateProfile(req, res));

// 프로필 삭제 (DELETE /api/profile)
router.delete('/', authMiddleware, (req, res) => profileController.deleteProfile(req, res));

// 프로필 비활성화 (POST /api/profile/deactivate)
router.post('/deactivate', authMiddleware, (req, res) => profileController.deactivateProfile(req, res));

// 성별별 활성 프로필 조회 (GET /api/profile/gender/:gender)
router.get('/gender/:gender', (req, res) => profileController.getActiveProfilesByGender(req, res));

// 나이 범위별 활성 프로필 조회 (GET /api/profile/age?minAge=X&maxAge=Y)
router.get('/age', (req, res) => profileController.getActiveProfilesByAgeRange(req, res));

// 온도 범위별 활성 프로필 조회 (GET /api/profile/tempus?minTemp=X&maxTemp=Y)
router.get('/tempus', (req, res) => profileController.getActiveProfilesByTempusRange(req, res));

module.exports = router;
