import { Request, Response } from 'express';
import { MarketService } from '../../application/market/MarketService';

export class MarketController {
  private marketService: MarketService;

  constructor(marketService: MarketService) {
    this.marketService = marketService;
  }

  create = async (req: Request, res: Response) => {
    const { title, desc, price } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const market = await this.marketService.createMarket(user.userId, title, desc, price);
    res.status(201).json(market);
  };

  list = async (req: Request, res: Response) => {
    const markets = await this.marketService.listMarkets();
    res.status(200).json(markets);
  };

  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const market = await this.marketService.getMarket(id);
    if (!market) return res.status(404).json({ error: '마켓 없음' });
    res.status(200).json(market);
  };
}