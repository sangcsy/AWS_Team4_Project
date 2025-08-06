import { Market } from '../../domain/market/Market';
import { MarketRepository } from '../../domain/market/MarketRepository';
import { UserRepository } from '../../domain/user/UserRepository';
import { ReviewRepository } from '../../domain/review/ReviewRepository';
import { v4 as uuidv4 } from 'uuid';

export class MarketService {
  private marketRepository: MarketRepository;
  private userRepository: UserRepository;
  private reviewRepository: ReviewRepository;

  constructor(marketRepository: MarketRepository, userRepository: UserRepository, reviewRepository: ReviewRepository) {
    this.marketRepository = marketRepository;
    this.userRepository = userRepository;
    this.reviewRepository = reviewRepository;
  }

  async createMarket(sellerId: string, title: string, desc: string, price: number): Promise<Market> {
    const market = new Market({
      id: uuidv4(),
      sellerId,
      title,
      desc,
      price,
      createdAt: new Date(),
    });
    await this.marketRepository.save(market);
    return market;
  }

  async getMarket(id: string): Promise<any> {
    const market = await this.marketRepository.findById(id);
    if (!market) return null;
    // 온도 기반 신뢰도
    const seller = await this.userRepository.findById(market.sellerId);
    const trust = seller ? seller.temperature : 36.5;
    // 후기 평균
    const reviews = await this.reviewRepository.findByMarketId(id);
    const reviewAvg = reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;
    return { ...market, trust, reviewAvg };
  }

  async listMarkets(): Promise<any[]> {
    const markets = await this.marketRepository.findAll();
    return Promise.all(markets.map(async m => {
      const seller = await this.userRepository.findById(m.sellerId);
      const trust = seller ? seller.temperature : 36.5;
      return { ...m, trust };
    }));
  }
}