import { Request, Response } from 'express';
import { MatchingService } from '../../../application/matching/MatchingService';
import { CreateMatchingPreferenceRequest, UpdateMatchingPreferenceRequest } from '../../../domain/matching/Matching';

export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  // 매칭 선호도 생성
  async createMatchingPreference(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const preferenceData: CreateMatchingPreferenceRequest = req.body;
      
      // 필수 필드 검증
      if (!preferenceData.preferredGender || !preferenceData.matchingAlgorithm) {
        res.status(400).json({ success: false, error: '필수 정보를 모두 입력해주세요.' });
        return;
      }

      const preference = await this.matchingService.createMatchingPreference(preferenceData, userId);
      
      res.status(201).json({
        success: true,
        message: '매칭 선호도가 성공적으로 생성되었습니다.',
        data: preference
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '매칭 선호도 생성에 실패했습니다.'
      });
    }
  }

  // 매칭 선호도 조회
  async getMatchingPreference(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const preference = await this.matchingService.getMatchingPreference(userId);
      
      if (!preference) {
        res.status(404).json({ success: false, error: '매칭 선호도를 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: preference
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '매칭 선호도 조회에 실패했습니다.'
      });
    }
  }

  // 매칭 선호도 수정
  async updateMatchingPreference(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const updates: UpdateMatchingPreferenceRequest = req.body;
      
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, error: '업데이트할 정보가 없습니다.' });
        return;
      }

      const preference = await this.matchingService.updateMatchingPreference(userId, updates);
      
      res.status(200).json({
        success: true,
        message: '매칭 선호도가 성공적으로 업데이트되었습니다.',
        data: preference
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '매칭 선호도 업데이트에 실패했습니다.'
      });
    }
  }

  // 매칭 선호도 삭제
  async deleteMatchingPreference(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.matchingService.deleteMatchingPreference(userId);
      
      res.status(200).json({
        success: true,
        message: '매칭 선호도가 성공적으로 삭제되었습니다.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '매칭 선호도 삭제에 실패했습니다.'
      });
    }
  }

  // 매칭 활성화
  async activateMatching(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.matchingService.activateMatching(userId);
      
      res.status(200).json({
        success: true,
        message: '매칭이 활성화되었습니다.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '매칭 활성화에 실패했습니다.'
      });
    }
  }

  // 매칭 비활성화
  async deactivateMatching(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.matchingService.deactivateMatching(userId);
      
      res.status(200).json({
        success: true,
        message: '매칭이 비활성화되었습니다.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '매칭 비활성화에 실패했습니다.'
      });
    }
  }

  // 랜덤 매칭 실행
  async executeRandomMatching(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const result = await this.matchingService.executeRandomMatching(userId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          error: '매칭 가능한 상대방이 없습니다.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '랜덤 매칭이 성공적으로 완료되었습니다.',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '랜덤 매칭에 실패했습니다.'
      });
    }
  }

  // 온도 기반 매칭 실행
  async executeTempusBasedMatching(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const result = await this.matchingService.executeTempusBasedMatching(userId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          error: '매칭 가능한 상대방이 없습니다.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '온도 기반 매칭이 성공적으로 완료되었습니다.',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '온도 기반 매칭에 실패했습니다.'
      });
    }
  }

  // 내 활성 매칭 조회
  async getMyActiveMatchings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const matchings = await this.matchingService.getMyActiveMatchings(userId);
      
      res.status(200).json({
        success: true,
        data: matchings
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '매칭 조회에 실패했습니다.'
      });
    }
  }

  // 매칭 상태 업데이트
  async updateMatchingStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      const { status } = req.body;
      
      if (!['active', 'completed', 'blocked'].includes(status)) {
        res.status(400).json({ success: false, error: '유효하지 않은 상태입니다.' });
        return;
      }

      const matching = await this.matchingService.updateMatchingStatus(matchingId, status);
      
      res.status(200).json({
        success: true,
        message: '매칭 상태가 성공적으로 업데이트되었습니다.',
        data: matching
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '매칭 상태 업데이트에 실패했습니다.'
      });
    }
  }

  // 매칭 삭제
  async deleteMatching(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const { matchingId } = req.params;
      await this.matchingService.deleteMatching(matchingId);
      
      res.status(200).json({
        success: true,
        message: '매칭이 성공적으로 삭제되었습니다.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '매칭 삭제에 실패했습니다.'
      });
    }
  }
}
