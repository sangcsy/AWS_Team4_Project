export interface Profile {
  id: string;
  userId: string;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  major: string;
  mbti: string;
  hobbies: string;
  profilePhotoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileRequest {
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  major: string;
  mbti: string;
  hobbies: string;
  profilePhotoUrl?: string;
}

export interface UpdateProfileRequest {
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  major?: string;
  mbti?: string;
  hobbies?: string;
  profilePhotoUrl?: string;
}

export interface ProfileWithUser {
  profile: Profile;
  user: {
    id: string;
    nickname: string;
    temperature: number;
  };
}
