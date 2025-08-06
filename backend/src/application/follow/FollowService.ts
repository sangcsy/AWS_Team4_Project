import { FollowRepository } from '../../domain/follow/FollowRepository';
import { UserRepository } from '../../domain/user/UserRepository';
import { PostRepository } from '../../domain/post/PostRepository';

export class FollowService {
  private followRepository: FollowRepository;
  private userRepository: UserRepository;
  private postRepository: PostRepository;

  constructor(followRepository: FollowRepository, userRepository: UserRepository, postRepository: PostRepository) {
    this.followRepository = followRepository;
    this.userRepository = userRepository;
    this.postRepository = postRepository;
  }

  async follow(followerId: string, followingNickname: string): Promise<boolean> {
    const followingUser = await this.userRepository.findByNickname(followingNickname);
    if (!followingUser) return false;
    await this.followRepository.follow(followerId, followingUser.id);
    return true;
  }

  async unfollow(followerId: string, followingNickname: string): Promise<boolean> {
    const followingUser = await this.userRepository.findByNickname(followingNickname);
    if (!followingUser) return false;
    await this.followRepository.unfollow(followerId, followingUser.id);
    return true;
  }

  async getFeed(userId: string) {
    // 팔로잉 목록
    const followings = await this.followRepository.getFollowings(userId);
    const followingIds = followings.map(f => f.followingId);
    // 팔로잉 유저들의 게시글 모음
    const posts = await this.postRepository.findAll();
    return posts.filter(p => followingIds.includes(p.authorId));
  }
}