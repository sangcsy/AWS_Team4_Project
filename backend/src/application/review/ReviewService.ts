import { Review } from '../../domain/review/Review';
import { ReviewRepository } from '../../domain/review/ReviewRepository';
import { UserRepository } from '../../domain/user/UserRepository';
import { v4 as uuidv4 } from 'uuid';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private userRepository: UserRepository;

  constructor(reviewRepository: ReviewRepository, userRepository: UserRepository) {
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
  }

  async createReview(marketId: string, reviewerId: string, rating: number, comment: string): Promise<Review> {
    const review = new Review({
      id: uuidv4(),
      marketId,
      reviewerId,
      rating,
      comment,
      createdAt: new Date(),
    });
    await this.reviewRepository.save(review);
    return review;
  }

  async listReviews(marketId: string): Promise<Review[]> {
    return this.reviewRepository.findByMarketId(marketId);
  }

  async getReviewAvg(marketId: string): Promise<number> {
    const reviews = await this.reviewRepository.findByMarketId(marketId);
    return reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;
  }
}