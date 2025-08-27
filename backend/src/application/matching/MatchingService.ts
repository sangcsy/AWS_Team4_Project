import { Matching, MatchingPreference, CreateMatchingPreferenceRequest, UpdateMatchingPreferenceRequest, MatchingCandidate, MatchingResult } from '../../domain/matching/Matching';
import { MatchingRepository } from '../../domain/matching/MatchingRepository';
import { ProfileService } from '../profile/ProfileService';
import { v4 as uuidv4 } from 'uuid';

export class MatchingService {
  constructor(
    private matchingRepository: MatchingRepository,
    private profileService: ProfileService
  ) {}

  // 매칭 선호도 생성
  async createMatchingPreference(preference: CreateMatchingPreferenceRequest, userId: string): Promise<MatchingPreference> {
    // 기존 선호도가 있는지 확인
    const existingPreference = await this.matchingRepository.findMatchingPreferenceByUserId(userId);
    if (existingPreference) {
      throw new Error('이미 매칭 선호도가 존재합니다.');
    }

    return await this.matchingRepository.createMatchingPreference(preference, userId);
  }

  // 매칭 선호도 조회
  async getMatchingPreference(userId: string): Promise<MatchingPreference | null> {
    return await this.matchingRepository.findMatchingPreferenceByUserId(userId);
  }

  // 매칭 선호도 수정
  async updateMatchingPreference(userId: string, updates: UpdateMatchingPreferenceRequest): Promise<MatchingPreference> {
    const preference = await this.matchingRepository.findMatchingPreferenceByUserId(userId);
    if (!preference) {
      throw new Error('매칭 선호도를 찾을 수 없습니다.');
    }

    return await this.matchingRepository.updateMatchingPreference(userId, updates);
  }

  // 매칭 선호도 삭제
  async deleteMatchingPreference(userId: string): Promise<void> {
    await this.matchingRepository.deleteMatchingPreference(userId);
  }

  // 매칭 활성화
  async activateMatching(userId: string): Promise<void> {
    await this.matchingRepository.activateMatchingPreference(userId);
  }

  // 매칭 비활성화
  async deactivateMatching(userId: string): Promise<void> {
    await this.matchingRepository.deactivateMatchingPreference(userId);
  }

  // 매칭 후보자 조회
  async findMatchingCandidates(userId: string, algorithm: 'random' | 'tempus_based'): Promise<MatchingCandidate[]> {
    return await this.matchingRepository.findMatchingCandidates(userId, algorithm);
  }

  // 랜덤 매칭 실행
  async executeRandomMatching(userId: string): Promise<MatchingResult | null> {
    try {
      // 사용자의 매칭 선호도 확인
      const preference = await this.matchingRepository.findMatchingPreferenceByUserId(userId);
      if (!preference || !preference.isActive) {
        throw new Error('매칭 선호도가 설정되지 않았거나 비활성화되어 있습니다.');
      }

      // 1. 먼저 현재 대기열에서 조건에 맞는 상대방 찾기
      const waitingPartner = await this.matchingRepository.findWaitingPartner(userId, preference);
      
      if (waitingPartner) {
        // 즉시 매칭 성공!
        const matching = await this.matchingRepository.createMatching(userId, waitingPartner.userId);
        
        // 대기열에서 상대방 제거
        await this.matchingRepository.removeFromQueue(waitingPartner.userId);
        
        // 3일 후 만료 설정
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);
        await this.matchingRepository.updateMatchingStatus(matching.id, 'active');

        return {
          matching: {
            ...matching,
            expiresAt
          },
          partnerProfile: waitingPartner.profile,
          partnerUser: waitingPartner.user
        };
      }

      // 2. 즉시 매칭이 안 되면 대기열에 등록
      await this.matchingRepository.addToQueue(userId, preference);
      
      return {
        matching: null,
        partnerProfile: null,
        partnerUser: null,
        message: '매칭 대기열에 등록되었습니다. 조건에 맞는 상대방이 나타나면 자동으로 매칭됩니다.',
        status: 'waiting'
      };
    } catch (error) {
      throw error;
    }
  }

  // 온도 기반 매칭 실행
  async executeTempusBasedMatching(userId: string): Promise<MatchingResult | null> {
    try {
      // 사용자의 매칭 선호도 확인
      const preference = await this.matchingRepository.findMatchingPreferenceByUserId(userId);
      if (!preference || !preference.isActive) {
        throw new Error('매칭 선호도가 설정되지 않았거나 비활성화되어 있습니다.');
      }

      // 매칭 후보자 조회 (온도 기반)
      const candidates = await this.findMatchingCandidates(userId, 'tempus_based');
      if (candidates.length === 0) {
        return null; // 매칭 가능한 후보자가 없음
      }

      // 온도 차이가 가장 적은 후보자 선택 (이미 정렬되어 있음)
      const selectedCandidate = candidates[0];

      // 매칭 생성
      const matching = await this.matchingRepository.createMatching(userId, selectedCandidate.userId);

      // 3일 후 만료 설정
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);
      await this.matchingRepository.updateMatchingStatus(matching.id, 'active');

      return {
        matching: {
          ...matching,
          expiresAt
        },
        partnerProfile: selectedCandidate.profile,
        partnerUser: selectedCandidate.user
      };
    } catch (error) {
      throw error;
    }
  }

  // 내 활성 매칭 조회
  async getMyActiveMatchings(userId: string): Promise<Matching[]> {
    return await this.matchingRepository.findActiveMatchingByUserId(userId);
  }

  // 매칭 상태 업데이트
  async updateMatchingStatus(matchingId: string, status: 'active' | 'completed' | 'blocked'): Promise<Matching> {
    return await this.matchingRepository.updateMatchingStatus(matchingId, status);
  }

  // 매칭 삭제
  async deleteMatching(matchingId: string): Promise<void> {
    await this.matchingRepository.deleteMatching(matchingId);
  }

  // 만료된 매칭 정리
  async cleanupExpiredMatchings(): Promise<void> {
    await this.matchingRepository.cleanupExpiredMatchings();
  }
}
