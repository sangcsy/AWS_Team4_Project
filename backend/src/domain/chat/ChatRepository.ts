import { ChatMessage, CreateChatMessageRequest, ChatRoom, ChatRoomWithPartner, ProfileRevealInfo, ChatMessageWithSender } from './Chat';

export interface ChatRepository {
  // 메시지 관련
  createMessage(message: CreateChatMessageRequest, matchingId: string, senderId: string): Promise<ChatMessage>;
  findMessagesByMatchingId(matchingId: string, limit?: number, offset?: number): Promise<ChatMessageWithSender[]>;
  findMessageById(id: string): Promise<ChatMessage | null>;
  deleteMessage(id: string): Promise<void>;
  
  // 채팅방 관련
  findChatRoomByMatchingId(matchingId: string): Promise<ChatRoom | null>;
  findChatRoomsByUserId(userId: string): Promise<ChatRoom[]>;
  findChatRoomWithPartner(matchingId: string, userId: string): Promise<ChatRoomWithPartner | null>;
  
  // 프로필 공개 관련
  getProfileRevealInfo(matchingId: string): Promise<ProfileRevealInfo>;
  
  // 메시지 수 계산
  getMessageCount(matchingId: string): Promise<number>;
  
  // 만료된 채팅방 정리
  cleanupExpiredChatRooms(): Promise<void>;
}
