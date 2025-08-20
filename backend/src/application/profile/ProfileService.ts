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

  async getProfile(userId: string): Promise<Profile | null> {
    return await this.profileRepository.findByUserId(userId);
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
