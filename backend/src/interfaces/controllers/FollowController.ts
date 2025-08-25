import { FollowService } from '../../application/follow/FollowService';
import { FollowRepositoryImpl } from '../../infrastructure/follow/FollowRepositoryImpl';

export class FollowController {
  private followService: FollowService;

  constructor() {
    const followRepository = new FollowRepositoryImpl();
    this.followService = new FollowService(followRepository);
  }

  followUser = async (req: any, res: any) => {
    try {
      const { followingId, following_id } = req.body;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      // followingId 또는 following_id 둘 다 지원
      const targetUserId = followingId || following_id;
      
      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          error: '팔로우할 사용자 ID를 입력해주세요.'
        });
      }

      const follow = await this.followService.followUser(followerId, { following_id: targetUserId });

      res.status(201).json({
        success: true,
        message: '팔로우가 완료되었습니다.',
        data: follow
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  };

  unfollowUser = async (req: any, res: any) => {
    try {
      const { followingId } = req.params;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      await this.followService.unfollowUser(followerId, followingId);

      res.json({
        success: true,
        message: '언팔로우가 완료되었습니다.'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getFollowers = async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getFollowers(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getFollowing = async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getFollowing(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getFollowStats = async (req: any, res: any) => {
    try {
      const { userId } = req.params;

      const stats = await this.followService.getFollowStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  isFollowing = async (req: any, res: any) => {
    try {
      const { followingId } = req.params;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const isFollowing = await this.followService.isFollowing(followerId, followingId);

      res.json({
        success: true,
        data: { is_following: isFollowing }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getUserFollowInfo = async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      const followInfo = await this.followService.getUserFollowInfo(currentUserId, userId);

      res.json({
        success: true,
        data: followInfo
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getMutualFollows = async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getMutualFollows(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  };
}

module.exports = { FollowController };
