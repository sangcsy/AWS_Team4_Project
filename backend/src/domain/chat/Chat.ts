export interface ChatMessage {
  id: string;
  matchingId: string;
  senderId: string;
  message: string;
  messageType: 'text' | 'image';
  createdAt: Date;
}

export interface CreateChatMessageRequest {
  message: string;
  messageType: 'text' | 'image';
}

export interface ChatRoom {
  matchingId: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: ChatMessage;
  messageCount: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface ChatRoomWithPartner {
  chatRoom: ChatRoom;
  partnerProfile: {
    height: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    major: string;
    mbti: string;
    hobbies: string;
  };
  partnerUser: {
    nickname: string;
    temperature: number;
  };
  profileRevealLevel: number; // 1, 2, 3단계
}

export interface ProfileRevealInfo {
  level: number;
  revealedFields: string[];
  nextLevelMessageCount: number;
}

export interface ChatMessageWithSender {
  message: ChatMessage;
  sender: {
    id: string;
    nickname: string;
  };
}
