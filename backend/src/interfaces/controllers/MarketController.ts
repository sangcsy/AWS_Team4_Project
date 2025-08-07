/**
 * @swagger
 * tags:
 *   name: Market
 *   description: 마켓(중고/재능) API
 */
import { Request, Response } from 'express';
import { MarketService } from '../../application/market/MarketService';

export class MarketController {
  private marketService: MarketService;

  constructor(marketService: MarketService) {
    this.marketService = marketService;
  }

  /**
   * @swagger
   * /api/market:
   *   post:
   *     summary: 마켓 상품 등록
   *     tags: [Market]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               desc:
   *                 type: string
   *               price:
   *                 type: number
   *     responses:
   *       201:
   *         description: 등록 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Market'
   */
  create = async (req: Request, res: Response) => {
    const { title, desc, price } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const market = await this.marketService.createMarket(user.userId, title, desc, price);
    res.status(201).json(market);
  };

  /**
   * @swagger
   * /api/market:
   *   get:
   *     summary: 마켓 상품 목록 조회
   *     tags: [Market]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 목록 반환
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Market'
   */
  list = async (req: Request, res: Response) => {
    const markets = await this.marketService.listMarkets();
    res.status(200).json(markets);
  };

  /**
   * @swagger
   * /api/market/{id}:
   *   get:
   *     summary: 마켓 상품 상세 조회
   *     tags: [Market]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 상세 반환
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Market'
   */
  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const market = await this.marketService.getMarket(id);
    if (!market) return res.status(404).json({ error: '마켓 없음' });
    res.status(200).json(market);
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Market:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         sellerId:
 *           type: string
 *         title:
 *           type: string
 *         desc:
 *           type: string
 *         price:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         trust:
 *           type: number
 *         reviewAvg:
 *           type: number
 */