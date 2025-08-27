import { Profile, CreateProfileRequest, UpdateProfileRequest, ProfileWithUser } from '../../domain/profile/Profile';
import { ProfileRepository } from '../../domain/profile/ProfileRepository';
import { v4 as uuidv4 } from 'uuid';

export class ProfileService {
  constructor(private profileRepository: ProfileRepository) {}

  async createProfile(profileData: CreateProfileRequest, userId: string): Promise<Profile> {
    // 기존 프로필이 있는지 확인
    const existingProfile = await this.profileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new Error('이미 프로필이 존재합니다.');
    }

    // 프로필 생성
    return await this.profileRepository.create(profileData, userId);
  }

  async getProfile(userId: string): Promise<any> {
    // 사용자 기본 정보와 프로필 정보를 함께 조회
    const profile = await this.profileRepository.findByUserId(userId);
    
    // 사용자 기본 정보 조회 (users 테이블)
    const user = await this.profileRepository.findUserById(userId);
    
    // 팔로우 통계 조회
    const followStats = await this.profileRepository.getFollowStats(userId);
    
    // 게시글 통계 조회
    const postStats = await this.profileRepository.getPostStats(userId);
    
    return {
      user: user || { id: userId, nickname: '사용자', email: '', temperature: 36.5, created_at: new Date() },
      stats: {
        total_posts: postStats.totalPosts || 0,
        total_likes: postStats.totalLikes || 0,
        total_followers: followStats.followerCount || 0,
        total_following: followStats.followingCount || 0
      },
      profile: profile
    };
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    // 매칭 중인지 확인 (매칭 중에는 수정 불가)
    // TODO: 매칭 상태 확인 로직 추가

    return await this.profileRepository.update(profile.id, updates);
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    await this.profileRepository.delete(profile.id);
  }

  async deactivateProfile(userId: string): Promise<void> {
    await this.profileRepository.deactivate(userId);
  }

  async getActiveProfilesByGender(gender: 'male' | 'female' | 'other'): Promise<Profile[]> {
    return await this.profileRepository.findActiveByGender(gender);
  }

  async getActiveProfilesByAgeRange(minAge: number, maxAge: number): Promise<Profile[]> {
    return await this.profileRepository.findActiveByAgeRange(minAge, maxAge);
  }

  async getActiveProfilesByTempusRange(minTemp: number, maxTemp: number): Promise<ProfileWithUser[]> {
    return await this.profileRepository.findActiveByTempusRange(minTemp, maxTemp);
  }

  async getAllActiveProfiles(): Promise<Profile[]> {
    return await this.profileRepository.findAllActive();
  }
}
