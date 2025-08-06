import { Review } from '../../domain/review/Review';
import { ReviewRepository } from '../../domain/review/ReviewRepository';

export class ReviewRepositoryImpl implements ReviewRepository {
  private reviews: Review[] = [];

  async findById(id: string): Promise<Review | null> {
    return this.reviews.find(r => r.id === id) || null;
  }

  async findByMarketId(marketId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.marketId === marketId);
  }

  async save(review: Review): Promise<void> {
    this.reviews.push(review);
  }

  async update(review: Review): Promise<void> {
    const idx = this.reviews.findIndex(r => r.id === review.id);
    if (idx !== -1) this.reviews[idx] = review;
  }

  async delete(id: string): Promise<void> {
    this.reviews = this.reviews.filter(r => r.id !== id);
  }
}