import { ChatMessage, CreateChatMessageRequest, ChatRoom, ChatRoomWithPartner, ProfileRevealInfo, ChatMessageWithSender } from '../../domain/chat/Chat';
import { ChatRepository } from '../../domain/chat/ChatRepository';
import { MatchingService } from '../matching/MatchingService';
import { ProfileService } from '../profile/ProfileService';

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private matchingService: MatchingService,
    private profileService: ProfileService
  ) {}

  // 메시지 전송
  async sendMessage(messageData: CreateChatMessageRequest, matchingId: string, senderId: string): Promise<ChatMessage> {
    // 매칭이 유효한지 확인
    const matching = await this.matchingService.getMyActiveMatchings(senderId);
    const isValidMatching = matching.some(m => m.id === matchingId && m.status === 'active');
    
    if (!isValidMatching) {
      throw new Error('유효하지 않은 매칭입니다.');
    }

    // 메시지 생성
    const message = await this.chatRepository.createMessage(messageData, matchingId, senderId);
    
    return message;
  }

  // 채팅방 메시지 조회
  async getMessages(matchingId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageWithSender[]> {
    // 매칭이 유효한지 확인
    const messages = await this.chatRepository.findMessagesByMatchingId(matchingId, limit, offset);
    return messages;
  }

  // 내 채팅방 목록 조회
  async getMyChatRooms(userId: string): Promise<ChatRoomWithPartner[]> {
    const chatRooms = await this.chatRepository.findChatRoomsByUserId(userId);
    const chatRoomsWithPartner: ChatRoomWithPartner[] = [];

    for (const chatRoom of chatRooms) {
      const chatRoomWithPartner = await this.chatRepository.findChatRoomWithPartner(chatRoom.matchingId, userId);
      if (chatRoomWithPartner) {
        chatRoomsWithPartner.push(chatRoomWithPartner);
      }
    }

    return chatRoomsWithPartner;
  }

  // 특정 채팅방 조회 (파트너 정보 포함)
  async getChatRoom(matchingId: string, userId: string): Promise<ChatRoomWithPartner | null> {
    return await this.chatRepository.findChatRoomWithPartner(matchingId, userId);
  }

  // 프로필 공개 정보 조회
  async getProfileRevealInfo(matchingId: string): Promise<ProfileRevealInfo> {
    return await this.chatRepository.getProfileRevealInfo(matchingId);
  }

  // 메시지 삭제
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.chatRepository.findMessageById(messageId);
    if (!message) {
      throw new Error('메시지를 찾을 수 없습니다.');
    }

    // 자신이 보낸 메시지만 삭제 가능
    if (message.senderId !== userId) {
      throw new Error('자신이 보낸 메시지만 삭제할 수 있습니다.');
    }

    await this.chatRepository.deleteMessage(messageId);
  }

  // 메시지 수 계산
  async getMessageCount(matchingId: string): Promise<number> {
    return await this.chatRepository.getMessageCount(matchingId);
  }

  // 프로필 공개 단계 계산
  private calculateProfileRevealLevel(messageCount: number): number {
    if (messageCount >= 20) return 3;
    if (messageCount >= 10) return 2;
    if (messageCount >= 5) return 1;
    return 0;
  }

  // 프로필 공개 필드 계산
  private getRevealedFields(level: number): string[] {
    switch (level) {
      case 1:
        return ['major', 'gender'];
      case 2:
        return ['major', 'gender', 'age', 'mbti', 'hobbies'];
      case 3:
        return ['major', 'gender', 'age', 'mbti', 'hobbies', 'name', 'height'];
      default:
        return [];
    }
  }

  // 다음 단계까지 필요한 메시지 수
  private getNextLevelMessageCount(currentLevel: number): number {
    switch (currentLevel) {
      case 0: return 5;
      case 1: return 10;
      case 2: return 20;
      default: return 0;
    }
  }

  // 만료된 채팅방 정리
  async cleanupExpiredChatRooms(): Promise<void> {
    await this.chatRepository.cleanupExpiredChatRooms();
  }
}
