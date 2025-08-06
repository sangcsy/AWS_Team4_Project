import { Request, Response } from 'express';
import { ReviewService } from '../../application/review/ReviewService';

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService) {
    this.reviewService = reviewService;
  }

  create = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { rating, comment } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const review = await this.reviewService.createReview(itemId, user.userId, rating, comment);
    res.status(201).json(review);
  };

  list = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const reviews = await this.reviewService.listReviews(itemId);
    res.status(200).json(reviews);
  };
}