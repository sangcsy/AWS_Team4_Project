import { Request, Response } from 'express';
import { ProfileService } from '../../../application/profile/ProfileService';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (req: Request, res: Response) => {
    try {
      // req.params.userId가 있으면 해당 사용자, 없으면 현재 로그인한 사용자
      const userId = req.params.userId || req.user?.['userId'];
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '사용자 ID가 필요합니다.'
        });
      }
      
      console.log('🔍 프로필 조회 요청:', { userId, currentUser: req.user?.['userId'] });
      
      const profile = await this.profileService.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: '프로필을 찾을 수 없습니다.'
        });
      }
      
      console.log('✅ 프로필 조회 성공:', profile);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('❌ 프로필 조회 실패:', error);
      res.status(500).json({
        success: false,
        error: '프로필 조회에 실패했습니다.'
      });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const updatedProfile = await this.profileService.updateProfile(userId, updateData);
      
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '프로필 업데이트에 실패했습니다.'
      });
    }
  };

  getUserPosts = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const posts = await this.profileService.getUserPosts(userId);
      
      res.json({
        success: true,
        data: { posts }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '사용자 게시글 조회에 실패했습니다.'
      });
    }
  };
}
