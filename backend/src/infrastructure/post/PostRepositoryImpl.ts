import { Post } from '../../domain/post/Post';
import { PostRepository } from '../../domain/post/PostRepository';

export class PostRepositoryImpl implements PostRepository {
  private posts: Post[] = [];

  async findById(id: string): Promise<Post | null> {
    return this.posts.find(p => p.id === id) || null;
  }

  async findAll(): Promise<Post[]> {
    return [...this.posts];
  }

  async save(post: Post): Promise<void> {
    this.posts.push(post);
  }

  async update(post: Post): Promise<void> {
    const idx = this.posts.findIndex(p => p.id === post.id);
    if (idx !== -1) this.posts[idx] = post;
  }

  async delete(id: string): Promise<void> {
    this.posts = this.posts.filter(p => p.id !== id);
  }
}