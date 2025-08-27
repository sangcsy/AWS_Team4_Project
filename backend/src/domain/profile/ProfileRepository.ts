import { Profile, CreateProfileRequest, UpdateProfileRequest, ProfileWithUser } from './Profile';

export interface ProfileRepository {
  create(profile: CreateProfileRequest, userId: string): Promise<Profile>;
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  update(id: string, updates: UpdateProfileRequest): Promise<Profile>;
  delete(id: string): Promise<void>;
  findAllActive(): Promise<Profile[]>;
  findActiveByGender(gender: 'male' | 'female' | 'other'): Promise<Profile[]>;
  findActiveByAgeRange(minAge: number, maxAge: number): Promise<Profile[]>;
  findActiveByTempusRange(minTemp: number, maxTemp: number): Promise<ProfileWithUser[]>;
  deactivate(userId: string): Promise<void>;
}
