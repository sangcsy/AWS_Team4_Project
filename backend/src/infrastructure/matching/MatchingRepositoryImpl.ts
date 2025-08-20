import { Matching, MatchingPreference, CreateMatchingPreferenceRequest, UpdateMatchingPreferenceRequest, MatchingCandidate } from '../../domain/matching/Matching';
import { MatchingRepository } from '../../domain/matching/MatchingRepository';
import { DatabaseConnection } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

export class MatchingRepositoryImpl implements MatchingRepository {
  private dbConnection: DatabaseConnection;

  constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
  }

  // 매칭 선호도 생성
  async createMatchingPreference(preference: CreateMatchingPreferenceRequest, userId: string): Promise<MatchingPreference> {
    const pool = await this.dbConnection.getPool();
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO matching_preferences (id, user_id, preferred_gender, min_age, max_age, matching_algorithm) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, preference.preferredGender, preference.minAge || null, preference.maxAge || null, preference.matchingAlgorithm]
    );

    return await this.findMatchingPreferenceByUserId(userId) as MatchingPreference;
  }

  // 매칭 선호도 조회
  async findMatchingPreferenceByUserId(userId: string): Promise<MatchingPreference | null> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM matching_preferences WHERE user_id = ?',
      [userId]
    );

    const preferences = rows as any[];
    if (preferences.length === 0) return null;

    return this.mapRowToMatchingPreference(preferences[0]);
  }

  // 매칭 선호도 수정
  async updateMatchingPreference(userId: string, updates: UpdateMatchingPreferenceRequest): Promise<MatchingPreference> {
    const pool = await this.dbConnection.getPool();
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${this.camelToSnake(key)} = ?`);
        updateValues.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('업데이트할 필드가 없습니다.');
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    await pool.execute(
      `UPDATE matching_preferences SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    return await this.findMatchingPreferenceByUserId(userId) as MatchingPreference;
  }

  // 매칭 선호도 삭제
  async deleteMatchingPreference(userId: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute('DELETE FROM matching_preferences WHERE user_id = ?', [userId]);
  }

  // 매칭 선호도 활성화
  async activateMatchingPreference(userId: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute(
      'UPDATE matching_preferences SET is_active = true WHERE user_id = ?',
      [userId]
    );
  }

  // 매칭 선호도 비활성화
  async deactivateMatchingPreference(userId: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute(
      'UPDATE matching_preferences SET is_active = false WHERE user_id = ?',
      [userId]
    );
  }

  // 매칭 생성
  async createMatching(user1Id: string, user2Id: string): Promise<Matching> {
    const pool = await this.dbConnection.getPool();
    const id = uuidv4();
    
    // 3일 후 만료 설정
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);
    
    const [result] = await pool.execute(
      `INSERT INTO matchings (id, user1_id, user2_id, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [id, user1Id, user2Id, expiresAt]
    );

    return await this.findMatchingById(id) as Matching;
  }

  // 매칭 조회
  async findMatchingById(id: string): Promise<Matching | null> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM matchings WHERE id = ?',
      [id]
    );

    const matchings = rows as any[];
    if (matchings.length === 0) return null;

    return this.mapRowToMatching(matchings[0]);
  }

  // 사용자의 활성 매칭 조회
  async findActiveMatchingByUserId(userId: string): Promise<Matching[]> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      `SELECT * FROM matchings 
       WHERE (user1_id = ? OR user2_id = ?) 
       AND status = 'active' 
       AND expires_at > NOW()`,
      [userId, userId]
    );

    return (rows as any[]).map(row => this.mapRowToMatching(row));
  }

  // 매칭 상태 업데이트
  async updateMatchingStatus(id: string, status: 'active' | 'completed' | 'blocked'): Promise<Matching> {
    const pool = await this.dbConnection.getPool();
    
    await pool.execute(
      'UPDATE matchings SET status = ? WHERE id = ?',
      [status, id]
    );

    return await this.findMatchingById(id) as Matching;
  }

  // 매칭 삭제
  async deleteMatching(id: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute('DELETE FROM matchings WHERE id = ?', [id]);
  }

  // 매칭 후보자 조회
  async findMatchingCandidates(userId: string, algorithm: 'random' | 'tempus_based'): Promise<MatchingCandidate[]> {
    const pool = await this.dbConnection.getPool();
    
    // 사용자의 매칭 선호도 조회
    const preference = await this.findMatchingPreferenceByUserId(userId);
    if (!preference) {
      throw new Error('매칭 선호도가 설정되지 않았습니다.');
    }

    // 사용자의 프로필 조회
    const [userProfileRows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    const userProfiles = userProfileRows as any[];
    if (userProfiles.length === 0) {
      throw new Error('사용자 프로필이 없습니다.');
    }
    const userProfile = userProfiles[0];

    // 성별 조건 설정
    let genderCondition = '';
    if (preference.preferredGender === 'male') {
      genderCondition = "AND p.gender = 'male'";
    } else if (preference.preferredGender === 'female') {
      genderCondition = "AND p.gender = 'female'";
    }

    // 나이 조건 설정
    let ageCondition = '';
    if (preference.minAge && preference.maxAge) {
      ageCondition = `AND p.age BETWEEN ${preference.minAge} AND ${preference.maxAge}`;
    }

    let query = '';
    let params: any[] = [];

    if (algorithm === 'tempus_based') {
      // 온도 기반 매칭 (온도 차이가 적은 순서로 정렬)
      query = `
        SELECT p.*, u.nickname, u.temperature,
               ABS(u.temperature - (SELECT temperature FROM users WHERE id = ?)) as tempus_difference
        FROM user_profiles p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.user_id != ? 
        AND p.is_active = true 
        AND u.id NOT IN (
          SELECT DISTINCT 
            CASE 
              WHEN user1_id = ? THEN user2_id 
              WHEN user2_id = ? THEN user1_id 
            END
          FROM matchings 
          WHERE (user1_id = ? OR user2_id = ?) 
          AND status = 'active'
        )
        ${genderCondition}
        ${ageCondition}
        ORDER BY tempus_difference ASC
      `;
      params = [userId, userId, userId, userId, userId, userId, userId];
    } else {
      // 랜덤 매칭
      query = `
        SELECT p.*, u.nickname, u.temperature, 0 as tempus_difference
        FROM user_profiles p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.user_id != ? 
        AND p.is_active = true 
        AND u.id NOT IN (
          SELECT DISTINCT 
            CASE 
              WHEN user1_id = ? THEN user2_id 
              WHEN user2_id = ? THEN user1_id 
            END
          FROM matchings 
          WHERE (user1_id = ? OR user2_id = ?) 
          AND status = 'active'
        )
        ${genderCondition}
        ${ageCondition}
        ORDER BY RAND()
      `;
      params = [userId, userId, userId, userId, userId];
    }

    const [rows] = await pool.execute(query, params);
    return (rows as any[]).map(row => this.mapRowToMatchingCandidate(row));
  }

  // 만료된 매칭 정리
  async cleanupExpiredMatchings(): Promise<void> {
    const pool = await this.dbConnection.getPool();
    
    // 만료된 매칭을 completed 상태로 변경
    await pool.execute(
      `UPDATE matchings 
       SET status = 'completed' 
       WHERE expires_at <= NOW() 
       AND status = 'active'`
    );
  }

  private mapRowToMatchingPreference(row: any): MatchingPreference {
    return {
      id: row.id,
      userId: row.user_id,
      preferredGender: row.preferred_gender,
      minAge: row.min_age,
      maxAge: row.max_age,
      matchingAlgorithm: row.matching_algorithm,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapRowToMatching(row: any): Matching {
    return {
      id: row.id,
      user1Id: row.user1_id,
      user2Id: row.user2_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at)
    };
  }

  private mapRowToMatchingCandidate(row: any): MatchingCandidate {
    return {
      userId: row.user_id,
      profile: {
        height: row.height,
        age: row.age,
        gender: row.gender,
        major: row.major,
        mbti: row.mbti,
        hobbies: row.hobbies
      },
      user: {
        nickname: row.nickname,
        temperature: row.temperature
      },
      tempusDifference: row.tempus_difference
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
