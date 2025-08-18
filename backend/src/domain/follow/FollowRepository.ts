import { Follow, CreateFollowRequest, FollowStats, FollowListResponse } from './Follow';

export interface FollowRepository {
  // 팔로우 관계 관리
  create(followerId: string, data: CreateFollowRequest): Promise<Follow>;
  delete(followerId: string, followingId: string): Promise<void>;
  
  // 팔로우 관계 확인
  exists(followerId: string, followingId: string): Promise<boolean>;
  
  // 팔로우 목록 조회
  getFollowers(userId: string, page?: number, limit?: number): Promise<FollowListResponse>;
  getFollowing(userId: string, page?: number, limit?: number): Promise<FollowListResponse>;
  
  // 팔로우 통계
  getFollowStats(userId: string): Promise<FollowStats>;
  
  // 팔로우 상태 확인
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // 상호 팔로우 확인 (친구 관계)
  getMutualFollows(userId: string, page?: number, limit?: number): Promise<FollowListResponse>;
}
