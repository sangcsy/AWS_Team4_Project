export interface Matching {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'active' | 'completed' | 'blocked';
  createdAt: Date;
  expiresAt: Date;
}

export interface MatchingPreference {
  id: string;
  userId: string;
  preferredGender: 'male' | 'female' | 'all';
  minAge?: number;
  maxAge?: number;
  matchingAlgorithm: 'random' | 'tempus_based';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMatchingPreferenceRequest {
  preferredGender: 'male' | 'female' | 'all';
  minAge?: number;
  maxAge?: number;
  matchingAlgorithm: 'random' | 'tempus_based';
}

export interface UpdateMatchingPreferenceRequest {
  preferredGender?: 'male' | 'female' | 'all';
  minAge?: number;
  maxAge?: number;
  matchingAlgorithm?: 'random' | 'tempus_based';
}

export interface MatchingCandidate {
  userId: string;
  profile: {
    height: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    major: string;
    mbti: string;
    hobbies: string;
  };
  user: {
    nickname: string;
    temperature: number;
  };
  tempusDifference: number;
}

export interface MatchingResult {
  matching: Matching;
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
}
