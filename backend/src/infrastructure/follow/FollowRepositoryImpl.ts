import { Follow } from '../../domain/follow/Follow';
import { FollowRepository } from '../../domain/follow/FollowRepository';

export class FollowRepositoryImpl implements FollowRepository {
  private follows: Follow[] = [];

  async follow(followerId: string, followingId: string): Promise<void> {
    if (!this.follows.some(f => f.followerId === followerId && f.followingId === followingId)) {
      this.follows.push(new Follow({ followerId, followingId, createdAt: new Date() }));
    }
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    this.follows = this.follows.filter(f => !(f.followerId === followerId && f.followingId === followingId));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.follows.some(f => f.followerId === followerId && f.followingId === followingId);
  }

  async getFollowings(userId: string): Promise<Follow[]> {
    return this.follows.filter(f => f.followerId === userId);
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return this.follows.filter(f => f.followingId === userId);
  }
}