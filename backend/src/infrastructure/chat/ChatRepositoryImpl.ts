import { ChatMessage, CreateChatMessageRequest, ChatRoom, ChatRoomWithPartner, ProfileRevealInfo, ChatMessageWithSender } from '../../domain/chat/Chat';
import { ChatRepository } from '../../domain/chat/ChatRepository';
import { DatabaseConnection } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

export class ChatRepositoryImpl implements ChatRepository {
  private dbConnection: DatabaseConnection;

  constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
  }

  // 메시지 생성
  async createMessage(message: CreateChatMessageRequest, matchingId: string, senderId: string): Promise<ChatMessage> {
    const pool = await this.dbConnection.getPool();
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO chat_messages (id, matching_id, sender_id, message, message_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, matchingId, senderId, message.message, message.messageType]
    );

    return await this.findMessageById(id) as ChatMessage;
  }

  // 매칭 ID로 메시지 조회
  async findMessagesByMatchingId(matchingId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageWithSender[]> {
    const pool = await this.dbConnection.getPool();
    
    const [rows] = await pool.execute(
      `SELECT cm.*, u.nickname 
       FROM chat_messages cm 
       JOIN users u ON cm.sender_id = u.id 
       WHERE cm.matching_id = ? 
       ORDER BY cm.created_at DESC 
       LIMIT ? OFFSET ?`,
      [matchingId, limit, offset]
    );

    return (rows as any[]).map(row => ({
      message: this.mapRowToChatMessage(row),
      sender: {
        id: row.sender_id,
        nickname: row.nickname
      }
    }));
  }

  // 메시지 ID로 메시지 조회
  async findMessageById(id: string): Promise<ChatMessage | null> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM chat_messages WHERE id = ?',
      [id]
    );

    const messages = rows as any[];
    if (messages.length === 0) return null;

    return this.mapRowToChatMessage(messages[0]);
  }

  // 메시지 삭제
  async deleteMessage(id: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute('DELETE FROM chat_messages WHERE id = ?', [id]);
  }

  // 매칭 ID로 채팅방 조회
  async findChatRoomByMatchingId(matchingId: string): Promise<ChatRoom | null> {
    const pool = await this.dbConnection.getPool();
    
    // 매칭 정보 조회
    const [matchingRows] = await pool.execute(
      'SELECT * FROM matchings WHERE id = ?',
      [matchingId]
    );
    
    if ((matchingRows as any[]).length === 0) return null;
    
    const matching = (matchingRows as any[])[0];
    
    // 마지막 메시지 조회
    const [lastMessageRows] = await pool.execute(
      `SELECT * FROM chat_messages 
       WHERE matching_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [matchingId]
    );
    
    // 메시지 수 계산
    const [messageCountRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE matching_id = ?',
      [matchingId]
    );
    
    const messageCount = (messageCountRows as any[])[0].count;
    const lastMessage = (lastMessageRows as any[]).length > 0 ? 
      this.mapRowToChatMessage((lastMessageRows as any[])[0]) : undefined;
    
    return {
      matchingId: matching.id,
      user1Id: matching.user1_id,
      user2Id: matching.user2_id,
      lastMessage,
      messageCount,
      createdAt: new Date(matching.created_at),
      expiresAt: new Date(matching.expires_at)
    };
  }

  // 사용자 ID로 채팅방 목록 조회
  async findChatRoomsByUserId(userId: string): Promise<ChatRoom[]> {
    const pool = await this.dbConnection.getPool();
    
    const [rows] = await pool.execute(
      `SELECT m.*, 
              (SELECT COUNT(*) FROM chat_messages WHERE matching_id = m.id) as message_count,
              (SELECT cm.id FROM chat_messages cm WHERE cm.matching_id = m.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_id,
              (SELECT cm.message FROM chat_messages cm WHERE cm.matching_id = m.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_text,
              (SELECT cm.message_type FROM chat_messages cm WHERE cm.matching_id = m.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_type,
              (SELECT cm.created_at FROM chat_messages cm WHERE cm.matching_id = m.id ORDER BY cm.created_at DESC LIMIT 1) as last_message_time
       FROM matchings m 
       WHERE (m.user1_id = ? OR m.user2_id = ?) 
       AND m.status = 'active' 
       AND m.expires_at > NOW()`,
      [userId, userId]
    );

    return (rows as any[]).map(row => ({
      matchingId: row.id,
      user1Id: row.user1_id,
      user2Id: row.user2_id,
      lastMessage: row.last_message_id ? {
        id: row.last_message_id,
        matchingId: row.id,
        senderId: '', // 실제 구현에서는 sender_id도 조회해야 함
        message: row.last_message_text,
        messageType: row.last_message_type,
        createdAt: new Date(row.last_message_time)
      } : undefined,
      messageCount: row.message_count,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at)
    }));
  }

  // 채팅방과 파트너 정보 조회
  async findChatRoomWithPartner(matchingId: string, userId: string): Promise<ChatRoomWithPartner | null> {
    const pool = await this.dbConnection.getPool();
    
    // 매칭 정보 조회
    const [matchingRows] = await pool.execute(
      'SELECT * FROM matchings WHERE id = ?',
      [matchingId]
    );
    
    if ((matchingRows as any[]).length === 0) return null;
    
    const matching = (matchingRows as any[])[0];
    
    // 파트너 ID 결정
    const partnerId = matching.user1_id === userId ? matching.user2_id : matching.user1_id;
    
    // 파트너 프로필 조회
    const [profileRows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [partnerId]
    );
    
    if ((profileRows as any[]).length === 0) return null;
    
    const partnerProfile = (profileRows as any[])[0];
    
    // 파트너 사용자 정보 조회
    const [userRows] = await pool.execute(
      'SELECT nickname, temperature FROM users WHERE id = ?',
      [partnerId]
    );
    
    if ((userRows as any[]).length === 0) return null;
    
    const partnerUser = (userRows as any[])[0];
    
    // 메시지 수 계산
    const [messageCountRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE matching_id = ?',
      [matchingId]
    );
    
    const messageCount = (messageCountRows as any[])[0].count;
    
    // 프로필 공개 단계 계산
    const profileRevealLevel = this.calculateProfileRevealLevel(messageCount);
    
    // 마지막 메시지 조회
    const [lastMessageRows] = await pool.execute(
      `SELECT * FROM chat_messages 
       WHERE matching_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [matchingId]
    );
    
    const lastMessage = (lastMessageRows as any[]).length > 0 ? 
      this.mapRowToChatMessage((lastMessageRows as any[])[0]) : undefined;
    
    return {
      chatRoom: {
        matchingId: matching.id,
        user1Id: matching.user1_id,
        user2Id: matching.user2_id,
        lastMessage,
        messageCount,
        createdAt: new Date(matching.created_at),
        expiresAt: new Date(matching.expires_at)
      },
      partnerProfile: {
        height: partnerProfile.height,
        age: partnerProfile.age,
        gender: partnerProfile.gender,
        major: partnerProfile.major,
        mbti: partnerProfile.mbti,
        hobbies: partnerProfile.hobbies
      },
      partnerUser: {
        nickname: partnerUser.nickname,
        temperature: partnerUser.temperature
      },
      profileRevealLevel
    };
  }

  // 프로필 공개 정보 조회
  async getProfileRevealInfo(matchingId: string): Promise<ProfileRevealInfo> {
    const pool = await this.dbConnection.getPool();
    
    // 메시지 수 계산
    const [messageCountRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE matching_id = ?',
      [matchingId]
    );
    
    const messageCount = (messageCountRows as any[])[0].count;
    const currentLevel = this.calculateProfileRevealLevel(messageCount);
    
    return {
      level: currentLevel,
      revealedFields: this.getRevealedFields(currentLevel),
      nextLevelMessageCount: this.getNextLevelMessageCount(currentLevel)
    };
  }

  // 메시지 수 계산
  async getMessageCount(matchingId: string): Promise<number> {
    const pool = await this.dbConnection.getPool();
    
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM chat_messages WHERE matching_id = ?',
      [matchingId]
    );
    
    return (rows as any[])[0].count;
  }

  // 만료된 채팅방 정리
  async cleanupExpiredChatRooms(): Promise<void> {
    const pool = await this.dbConnection.getPool();
    
    // 만료된 매칭을 completed 상태로 변경
    await pool.execute(
      `UPDATE matchings 
       SET status = 'completed' 
       WHERE expires_at <= NOW() 
       AND status = 'active'`
    );
  }

  private mapRowToChatMessage(row: any): ChatMessage {
    return {
      id: row.id,
      matchingId: row.matching_id,
      senderId: row.sender_id,
      message: row.message,
      messageType: row.message_type,
      createdAt: new Date(row.created_at)
    };
  }

  private calculateProfileRevealLevel(messageCount: number): number {
    if (messageCount >= 20) return 3;
    if (messageCount >= 10) return 2;
    if (messageCount >= 5) return 1;
    return 0;
  }

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

  private getNextLevelMessageCount(currentLevel: number): number {
    switch (currentLevel) {
      case 0: return 5;
      case 1: return 10;
      case 2: return 20;
      default: return 0;
    }
  }
}
