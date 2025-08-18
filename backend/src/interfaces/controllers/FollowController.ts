const { FollowService } = require('../../application/follow/FollowService');
const { FollowRepositoryImpl } = require('../../infrastructure/follow/FollowRepositoryImpl');

class FollowController {
  constructor() {
    const followRepository = new FollowRepositoryImpl();
    this.followService = new FollowService(followRepository);
  }

  followUser = async (req, res) => {
    try {
      const { following_id } = req.body;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다.'
        });
      }

      if (!following_id) {
        return res.status(400).json({
          success: false,
          error: '팔로우할 사용자 ID를 입력해주세요.'
        });
      }

      const follow = await this.followService.followUser(followerId, { following_id });

      res.status(201).json({
        success: true,
        message: '팔로우가 완료되었습니다.',
        data: follow
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  unfollowUser = async (req, res) => {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

  getFollowers = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getFollowers(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getFollowing = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getFollowing(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getFollowStats = async (req, res) => {
    try {
      const { userId } = req.params;

      const stats = await this.followService.getFollowStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  isFollowing = async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getUserFollowInfo = async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getMutualFollows = async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.followService.getMutualFollows(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = { FollowController };
