const { Router } = require('express');
const { ChatController } = require('../../controllers/chat/ChatController');
const { ChatService } = require('../../../application/chat/ChatService');
const { ChatRepositoryImpl } = require('../../../infrastructure/chat/ChatRepositoryImpl');
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
const chatRepository = new ChatRepositoryImpl();
const chatService = new ChatService(chatRepository, matchingService, profileService);
const chatController = new ChatController(chatService);

// 메시지 전송 (POST /api/chat/:matchingId/messages)
router.post('/:matchingId/messages', authMiddleware, (req, res) => chatController.sendMessage(req, res));

// 채팅방 메시지 조회 (GET /api/chat/:matchingId/messages)
router.get('/:matchingId/messages', authMiddleware, (req, res) => chatController.getMessages(req, res));

// 내 채팅방 목록 조회 (GET /api/chat/rooms)
router.get('/rooms', authMiddleware, (req, res) => chatController.getMyChatRooms(req, res));

// 특정 채팅방 조회 (GET /api/chat/:matchingId/room)
router.get('/:matchingId/room', authMiddleware, (req, res) => chatController.getChatRoom(req, res));

// 프로필 공개 정보 조회 (GET /api/chat/:matchingId/profile-reveal)
router.get('/:matchingId/profile-reveal', authMiddleware, (req, res) => chatController.getProfileRevealInfo(req, res));

// 메시지 삭제 (DELETE /api/chat/messages/:messageId)
router.delete('/messages/:messageId', authMiddleware, (req, res) => chatController.deleteMessage(req, res));

// 메시지 수 조회 (GET /api/chat/:matchingId/message-count)
router.get('/:matchingId/message-count', authMiddleware, (req, res) => chatController.getMessageCount(req, res));

module.exports = router;
