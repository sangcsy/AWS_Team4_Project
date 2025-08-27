import { v4 as uuidv4 } from 'uuid';
import { FollowRepository } from '../../domain/follow/FollowRepository';
import { 
  Follow, 
  CreateFollowRequest, 
  FollowResponse, 
  FollowStats, 
  FollowListResponse,
  UserFollowInfo 
} from '../../domain/follow/Follow';
import { NotificationService } from '../notification/NotificationService';
import { NotificationRepositoryImpl } from '../../infrastructure/notification/NotificationRepositoryImpl';

export class FollowService {
  private notificationService: NotificationService;

  constructor(private followRepository: FollowRepository) {
    const notificationRepository = new NotificationRepositoryImpl();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async followUser(followerId: string, data: CreateFollowRequest): Promise<FollowResponse> {
    // 자기 자신을 팔로우할 수 없음
    if (followerId === data.following_id) {
      throw new Error('자기 자신을 팔로우할 수 없습니다.');
    }

    // 이미 팔로우하고 있는지 확인
    const isFollowing = await this.followRepository.exists(followerId, data.following_id);
    if (isFollowing) {
      throw new Error('이미 팔로우하고 있는 사용자입니다.');
    }

    const follow = await this.followRepository.create(followerId, data);
    
    // 팔로우 알림 생성
    try {
      console.log('🔔 팔로우 알림 생성 시작:', { 
        followerId, 
        followingId: data.following_id,
        followId: follow.id 
      });
      
      // 팔로우하는 사용자의 닉네임 가져오기
      const userRepository = new (await import('../../functions/auth/UserRepositoryImpl')).UserRepositoryImpl();
      const follower = await userRepository.findById(followerId);
      
      console.log('🔔 팔로우 사용자 정보 조회 결과:', {
        id: follower?.id,
        nickname: follower?.nickname,
        email: follower?.email
      });
      
      if (follower) {
        console.log('🔔 팔로우 알림 생성 중...');
        await this.notificationService.createFollowNotification(
          data.following_id,
          followerId,
          follower.nickname
        );
        console.log('✅ 팔로우 알림 생성 완료');
      } else {
        console.log('❌ 팔로우 사용자 정보를 찾을 수 없음');
      }
    } catch (error) {
      console.error('❌ 팔로우 알림 생성 실패:', error);
      // 알림 생성 실패는 팔로우 기능에 영향을 주지 않음
    }
    
    return this.toFollowResponse(follow);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // 팔로우 관계가 존재하는지 확인
    const isFollowing = await this.followRepository.exists(followerId, followingId);
    if (!isFollowing) {
      throw new Error('팔로우하고 있지 않은 사용자입니다.');
    }

    await this.followRepository.delete(followerId, followingId);
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 10): Promise<FollowListResponse> {
    const result = await this.followRepository.getFollowers(userId, page, limit);
    return {
      follows: result.follows.map(follow => this.toFollowResponse(follow)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 10): Promise<FollowListResponse> {
    const result = await this.followRepository.getFollowing(userId, page, limit);
    return {
      follows: result.follows.map(follow => this.toFollowResponse(follow)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }

  async getFollowStats(userId: string): Promise<FollowStats> {
    return await this.followRepository.getFollowStats(userId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return await this.followRepository.isFollowing(followerId, followingId);
  }

  async getUserFollowInfo(currentUserId: string, targetUserId: string): Promise<UserFollowInfo> {
    const [isFollowing, followStats] = await Promise.all([
      this.followRepository.isFollowing(currentUserId, targetUserId),
      this.followRepository.getFollowStats(targetUserId)
    ]);

    return {
      user_id: targetUserId,
      is_following: isFollowing,
      follow_stats: followStats
    };
  }

  async getMutualFollows(userId: string, page: number = 1, limit: number = 10): Promise<FollowListResponse> {
    const result = await this.followRepository.getMutualFollows(userId, page, limit);
    return {
      follows: result.follows.map(follow => this.toFollowResponse(follow)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }

  private toFollowResponse(follow: Follow): FollowResponse {
    return {
      id: follow.id,
      follower_id: follow.follower_id,
      following_id: follow.following_id,
      created_at: follow.created_at
    };
  }
}
