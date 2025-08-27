import express from 'express';
import { ChatController } from '../controllers/chat/ChatController';

const router = express.Router();
const chatController = new ChatController();

// 채팅 메시지 조회
router.get('/:matchingId/messages', chatController.getMessages);

// 채팅 메시지 전송
router.post('/:matchingId/messages', chatController.sendMessage);

// 채팅방 정보 조회
router.get('/:matchingId', chatController.getChatRoom);

export default router;
