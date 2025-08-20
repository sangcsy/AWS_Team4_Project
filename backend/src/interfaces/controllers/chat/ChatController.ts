import { Request, Response } from 'express';
import { ChatService } from '../../../application/chat/ChatService';
import { CreateChatMessageRequest } from '../../../domain/chat/Chat';

export class ChatController {
  constructor(private chatService: ChatService) {}

  // 메시지 전송
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const messageData: CreateChatMessageRequest = req.body;
      
      // 필수 필드 검증
      if (!messageData.message || !messageData.messageType) {
        res.status(400).json({ success: false, error: '메시지와 타입을 입력해주세요.' });
        return;
      }

      const message = await this.chatService.sendMessage(messageData, matchingId, userId);
      
      res.status(201).json({
        success: true,
        message: '메시지가 성공적으로 전송되었습니다.',
        data: message
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '메시지 전송에 실패했습니다.'
      });
    }
  }

  // 채팅방 메시지 조회
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const { limit = '50', offset = '0' } = req.query;
      
      const messages = await this.chatService.getMessages(
        matchingId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '메시지 조회에 실패했습니다.'
      });
    }
  }

  // 내 채팅방 목록 조회
  async getMyChatRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const chatRooms = await this.chatService.getMyChatRooms(userId);
      
      res.status(200).json({
        success: true,
        data: chatRooms
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '채팅방 조회에 실패했습니다.'
      });
    }
  }

  // 특정 채팅방 조회
  async getChatRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const chatRoom = await this.chatService.getChatRoom(matchingId, userId);
      
      if (!chatRoom) {
        res.status(404).json({ success: false, error: '채팅방을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: chatRoom
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '채팅방 조회에 실패했습니다.'
      });
    }
  }

  // 프로필 공개 정보 조회
  async getProfileRevealInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const profileRevealInfo = await this.chatService.getProfileRevealInfo(matchingId);
      
      res.status(200).json({
        success: true,
        data: profileRevealInfo
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 공개 정보 조회에 실패했습니다.'
      });
    }
  }

  // 메시지 삭제
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { messageId } = req.params;
      await this.chatService.deleteMessage(messageId, userId);
      
      res.status(200).json({
        success: true,
        message: '메시지가 성공적으로 삭제되었습니다.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '메시지 삭제에 실패했습니다.'
      });
    }
  }

  // 메시지 수 조회
  async getMessageCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const messageCount = await this.chatService.getMessageCount(matchingId);
      
      res.status(200).json({
        success: true,
        data: { messageCount }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '메시지 수 조회에 실패했습니다.'
      });
    }
  }
}
