import { Post } from '../../domain/post/Post';
import { PostRepository } from '../../domain/post/PostRepository';
import { UserRepository } from '../../domain/user/UserRepository';
import { v4 as uuidv4 } from 'uuid';

export class PostService {
  private postRepository: PostRepository;
  private userRepository: UserRepository;

  constructor(postRepository: PostRepository, userRepository: UserRepository) {
    this.postRepository = postRepository;
    this.userRepository = userRepository;
  }

  async createPost(authorId: string, title: string, content: string): Promise<Post> {
    const post = new Post({
      id: uuidv4(),
      authorId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.postRepository.save(post);
    // 온도 상승
    const user = await this.userRepository.findById(authorId);
    if (user) {
      user.temperature += 0.2;
      await this.userRepository.save(user);
    }
    return post;
  }

  async getPost(id: string): Promise<Post | null> {
    return this.postRepository.findById(id);
  }

  async updatePost(id: string, authorId: string, title: string, content: string): Promise<Post | null> {
    const post = await this.postRepository.findById(id);
    if (!post || post.authorId !== authorId) return null;
    post.title = title;
    post.content = content;
    post.updatedAt = new Date();
    await this.postRepository.update(post);
    return post;
  }

  async deletePost(id: string, authorId: string): Promise<boolean> {
    const post = await this.postRepository.findById(id);
    if (!post || post.authorId !== authorId) return false;
    await this.postRepository.delete(id);
    return true;
  }

  async listPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }
}