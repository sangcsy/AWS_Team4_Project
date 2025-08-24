import { Matching, MatchingPreference, CreateMatchingPreferenceRequest, UpdateMatchingPreferenceRequest, MatchingCandidate } from './Matching';

export interface MatchingRepository {
  // 매칭 선호도 관련
  createMatchingPreference(preference: CreateMatchingPreferenceRequest, userId: string): Promise<MatchingPreference>;
  findMatchingPreferenceByUserId(userId: string): Promise<MatchingPreference | null>;
  updateMatchingPreference(userId: string, updates: UpdateMatchingPreferenceRequest): Promise<MatchingPreference>;
  deleteMatchingPreference(userId: string): Promise<void>;
  activateMatchingPreference(userId: string): Promise<void>;
  deactivateMatchingPreference(userId: string): Promise<void>;

  // 매칭 관련
  createMatching(user1Id: string, user2Id: string): Promise<Matching>;
  findMatchingById(id: string): Promise<Matching | null>;
  findActiveMatchingByUserId(userId: string): Promise<Matching[]>;
  updateMatchingStatus(id: string, status: 'active' | 'completed' | 'blocked'): Promise<Matching>;
  deleteMatching(id: string): Promise<void>;
  
  // 매칭 후보자 조회
  findMatchingCandidates(userId: string, algorithm: 'random' | 'tempus_based'): Promise<MatchingCandidate[]>;
  
  // 만료된 매칭 정리
  cleanupExpiredMatchings(): Promise<void>;
  
  // 매칭 대기열 관련
  addToQueue(userId: string, preference: MatchingPreference): Promise<void>;
  removeFromQueue(userId: string): Promise<void>;
  findWaitingPartner(userId: string, preference: MatchingPreference): Promise<MatchingCandidate | null>;
  cleanupExpiredQueueItems(): Promise<void>;
}
