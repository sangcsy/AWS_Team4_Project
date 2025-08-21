import { Review } from './Review';

export interface ReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByMarketId(marketId: string): Promise<Review[]>;
  save(review: Review): Promise<void>;
  update(review: Review): Promise<void>;
  delete(id: string): Promise<void>;
}