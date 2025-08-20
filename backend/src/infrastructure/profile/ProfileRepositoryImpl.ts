import { Profile, CreateProfileRequest, UpdateProfileRequest, ProfileWithUser } from '../../domain/profile/Profile';
import { ProfileRepository } from '../../domain/profile/ProfileRepository';
import { DatabaseConnection } from '../../shared/database';
import { v4 as uuidv4 } from 'uuid';

export class ProfileRepositoryImpl implements ProfileRepository {
  private dbConnection: DatabaseConnection;

  constructor() {
    this.dbConnection = DatabaseConnection.getInstance();
  }

  async create(profileData: CreateProfileRequest, userId: string): Promise<Profile> {
    const pool = await this.dbConnection.getPool();
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO user_profiles (id, user_id, height, age, gender, major, mbti, hobbies, profile_photo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, profileData.height, profileData.age, profileData.gender, 
       profileData.major, profileData.mbti, profileData.hobbies, profileData.profilePhotoUrl || null]
    );

    return await this.findById(id) as Profile;
  }

  async findById(id: string): Promise<Profile | null> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE id = ?',
      [id]
    );

    const profiles = rows as any[];
    if (profiles.length === 0) return null;

    return this.mapRowToProfile(profiles[0]);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const profiles = rows as any[];
    if (profiles.length === 0) return null;

    return this.mapRowToProfile(profiles[0]);
  }

  async update(id: string, updates: UpdateProfileRequest): Promise<Profile> {
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
    updateValues.push(id);
    
    await pool.execute(
      `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id) as Profile;
  }

  async delete(id: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute('DELETE FROM user_profiles WHERE id = ?', [id]);
  }

  async findAllActive(): Promise<Profile[]> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE is_active = true'
    );

    return (rows as any[]).map(row => this.mapRowToProfile(row));
  }

  async findActiveByGender(gender: 'male' | 'female' | 'other'): Promise<Profile[]> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE gender = ? AND is_active = true',
      [gender]
    );

    return (rows as any[]).map(row => this.mapRowToProfile(row));
  }

  async findActiveByAgeRange(minAge: number, maxAge: number): Promise<Profile[]> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM user_profiles WHERE age BETWEEN ? AND ? AND is_active = true',
      [minAge, maxAge]
    );

    return (rows as any[]).map(row => this.mapRowToProfile(row));
  }

  async findActiveByTempusRange(minTemp: number, maxTemp: number): Promise<ProfileWithUser[]> {
    const pool = await this.dbConnection.getPool();
    const [rows] = await pool.execute(
      `SELECT p.*, u.nickname, u.temperature 
       FROM user_profiles p 
       JOIN users u ON p.user_id = u.id 
       WHERE u.temperature BETWEEN ? AND ? AND p.is_active = true`,
      [minTemp, maxTemp]
    );

    return (rows as any[]).map(row => ({
      profile: this.mapRowToProfile(row),
      user: {
        id: row.user_id,
        nickname: row.nickname,
        temperature: row.temperature
      }
    }));
  }

  async deactivate(userId: string): Promise<void> {
    const pool = await this.dbConnection.getPool();
    await pool.execute(
      'UPDATE user_profiles SET is_active = false WHERE user_id = ?',
      [userId]
    );
  }

  private mapRowToProfile(row: any): Profile {
    return {
      id: row.id,
      userId: row.user_id,
      height: row.height,
      age: row.age,
      gender: row.gender,
      major: row.major,
      mbti: row.mbti,
      hobbies: row.hobbies,
      profilePhotoUrl: row.profile_photo_url,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
