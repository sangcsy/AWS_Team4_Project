import { Request, Response } from 'express';
import { ProfileService } from '../../../application/profile/ProfileService';
import { CreateProfileRequest, UpdateProfileRequest } from '../../../domain/profile/Profile';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  async createProfile(req: Request, res: Response) {
    try {
        console.log('ProfileController - createProfile called');
        console.log('ProfileController - req.user:', req.user);
        console.log('ProfileController - req.user.userId:', req.user?.userId);
        
        if (!req.user || !req.user.userId) {
            console.log('ProfileController - No user found in request');
            return res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        }

        const userId = req.user.userId; // 이 줄이 제대로 있는지 확인
        console.log('ProfileController - userId extracted:', userId); // 추가 로그
        
        const profileData: CreateProfileRequest = req.body;
        
        if (!profileData.height || !profileData.age || !profileData.gender || 
            !profileData.major || !profileData.mbti || !profileData.hobbies) {
            return res.status(400).json({
                success: false,
                error: '필수 정보를 모두 입력해주세요.'
            });
        }

        const profile = await this.profileService.createProfile(profileData, userId);
        
        res.status(201).json({
            success: true,
            message: '프로필이 생성되었습니다.',
            data: profile
        });
    } catch (error) {
        console.error('ProfileController - createProfile error:', error);
        res.status(500).json({
            success: false,
            error: '프로필 생성 중 오류가 발생했습니다.'
        });
    }
}

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const profile = await this.profileService.getProfile(userId);
      
      if (!profile) {
        res.status(404).json({ success: false, error: '프로필을 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 조회에 실패했습니다.'
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      const updates: UpdateProfileRequest = req.body;
      
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, error: '업데이트할 정보가 없습니다.' });
        return;
      }

      const profile = await this.profileService.updateProfile(userId, updates);
      
      res.status(200).json({
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: profile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '프로필 업데이트에 실패했습니다.'
      });
    }
  }

  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.profileService.deleteProfile(userId);
      
      res.status(200).json({
        success: true,
        message: '프로필이 성공적으로 삭제되었습니다.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '프로필 삭제에 실패했습니다.'
      });
    }
  }

  async deactivateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: '인증이 필요합니다.' });
        return;
      }

      await this.profileService.deactivateProfile(userId);
      
      res.status(200).json({
        success: true,
        message: '프로필이 비활성화되었습니다.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 비활성화에 실패했습니다.'
      });
    }
  }

  async getActiveProfilesByGender(req: Request, res: Response): Promise<void> {
    try {
      const { gender } = req.params;
      
      if (!['male', 'female', 'other'].includes(gender)) {
        res.status(400).json({ success: false, error: '유효하지 않은 성별입니다.' });
        return;
      }

      const profiles = await this.profileService.getActiveProfilesByGender(gender as any);
      
      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 조회에 실패했습니다.'
      });
    }
  }

  async getActiveProfilesByAgeRange(req: Request, res: Response): Promise<void> {
    try {
      const { minAge, maxAge } = req.query;
      
      if (!minAge || !maxAge) {
        res.status(400).json({ success: false, error: '나이 범위를 지정해주세요.' });
        return;
      }

      const profiles = await this.profileService.getActiveProfilesByAgeRange(
        parseInt(minAge as string), 
        parseInt(maxAge as string)
      );
      
      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 조회에 실패했습니다.'
      });
    }
  }

  async getActiveProfilesByTempusRange(req: Request, res: Response): Promise<void> {
    try {
      const { minTemp, maxTemp } = req.query;
      
      if (!minTemp || !maxTemp) {
        res.status(400).json({ success: false, error: '온도 범위를 지정해주세요.' });
        return;
      }

      const profiles = await this.profileService.getActiveProfilesByTempusRange(
        parseFloat(minTemp as string), 
        parseFloat(maxTemp as string)
      );
      
      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '프로필 조회에 실패했습니다.'
      });
    }
  }
}
