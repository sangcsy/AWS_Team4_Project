import { Follow } from './Follow';

export interface FollowRepository {
  follow(followerId: string, followingId: string): Promise<void>;
  unfollow(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowings(userId: string): Promise<Follow[]>;
  getFollowers(userId: string): Promise<Follow[]>;
}