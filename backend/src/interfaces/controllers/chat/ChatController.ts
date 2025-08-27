import { Request, Response } from 'express';
import { ChatService } from '../../../application/chat/ChatService';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  getMessages = async (req: Request, res: Response) => {
    try {
      const { matchingId } = req.params;
      const messages = await this.chatService.getMessages(matchingId);
      
      res.json({
        success: true,
        data: { messages }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '메시지 조회에 실패했습니다.'
      });
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { matchingId } = req.params;
      const { senderId, message } = req.body;
      const sentMessage = await this.chatService.sendMessage(matchingId, senderId, message);
      
      res.json({
        success: true,
        data: sentMessage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '메시지 전송에 실패했습니다.'
      });
    }
  };

  getChatRoom = async (req: Request, res: Response) => {
    try {
      const { matchingId } = req.params;
      const chatRoom = await this.chatService.getChatRoom(matchingId);
      
      res.json({
        success: true,
        data: chatRoom
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '채팅방 정보 조회에 실패했습니다.'
      });
    }
  };
}
