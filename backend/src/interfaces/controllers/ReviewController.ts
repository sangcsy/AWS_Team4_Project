/**
 * @swagger
 * tags:
 *   name: Review
 *   description: 마켓 후기 API
 */
import { Request, Response } from 'express';
import { ReviewService } from '../../application/review/ReviewService';

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService) {
    this.reviewService = reviewService;
  }

  /**
   * @swagger
   * /api/market/{itemId}/review:
   *   post:
   *     summary: 마켓 후기 등록
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rating:
   *                 type: number
   *               comment:
   *                 type: string
   *     responses:
   *       201:
   *         description: 등록 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Review'
   */
  create = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { rating, comment } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const review = await this.reviewService.createReview(itemId, user.userId, rating, comment);
    res.status(201).json(review);
  };

  /**
   * @swagger
   * /api/market/{itemId}/review:
   *   get:
   *     summary: 마켓 후기 목록 조회
   *     tags: [Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 목록 반환
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Review'
   */
  list = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const reviews = await this.reviewService.listReviews(itemId);
    res.status(200).json(reviews);
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         marketId:
 *           type: string
 *         reviewerId:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */