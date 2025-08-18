export interface Follow {
  id: string;
  follower_id: string; // 팔로우하는 사용자
  following_id: string; // 팔로우받는 사용자
  created_at: Date;
}

export interface CreateFollowRequest {
  following_id: string; // 팔로우할 사용자 ID
}

export interface FollowResponse {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
}

export interface FollowStats {
  follower_count: number; // 나를 팔로우하는 사람 수
  following_count: number; // 내가 팔로우하는 사람 수
}

export interface FollowListResponse {
  follows: FollowResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFollowInfo {
  user_id: string;
  is_following: boolean; // 현재 사용자가 이 사용자를 팔로우하고 있는지
  follow_stats: FollowStats;
}
