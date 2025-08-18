import { Post, CreatePostRequest, UpdatePostRequest } from './Post';

export interface PostRepository {
  create(postData: CreatePostRequest, userId: string): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ posts: Post[], total: number }>;
  findAll(page?: number, limit?: number): Promise<{ posts: Post[], total: number }>;
  update(id: string, updates: UpdatePostRequest, userId: string): Promise<Post>;
  delete(id: string, userId: string): Promise<void>;
  updateTemperature(id: string, temperatureChange: number): Promise<Post>;
}
