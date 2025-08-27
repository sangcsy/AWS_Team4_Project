import { Request, Response } from 'express';
import { MatchingService } from '../../../application/matching/MatchingService';

export class MatchingController {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  requestMatching = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const matching = await this.matchingService.requestMatching(userId);
      
      res.json({
        success: true,
        data: matching
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '매칭 요청에 실패했습니다.'
      });
    }
  };

  getMatchingStatus = async (req: Request, res: Response) => {
    try {
      const { matchingId } = req.params;
      const status = await this.matchingService.getMatchingStatus(matchingId);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '매칭 상태 조회에 실패했습니다.'
      });
    }
  };

  endMatching = async (req: Request, res: Response) => {
    try {
      const { matchingId } = req.params;
      await this.matchingService.endMatching(matchingId);
      
      res.json({
        success: true,
        message: '매칭이 종료되었습니다.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '매칭 종료에 실패했습니다.'
      });
    }
  };

  getMatchingHistory = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const history = await this.matchingService.getMatchingHistory(userId);
      
      res.json({
        success: true,
        data: { history }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '매칭 히스토리 조회에 실패했습니다.'
      });
    }
  };
}
