import { Market } from '../../domain/market/Market';
import { MarketRepository } from '../../domain/market/MarketRepository';

export class MarketRepositoryImpl implements MarketRepository {
  private markets: Market[] = [];

  async findById(id: string): Promise<Market | null> {
    return this.markets.find(m => m.id === id) || null;
  }

  async findAll(): Promise<Market[]> {
    return [...this.markets];
  }

  async save(market: Market): Promise<void> {
    this.markets.push(market);
  }

  async update(market: Market): Promise<void> {
    const idx = this.markets.findIndex(m => m.id === market.id);
    if (idx !== -1) this.markets[idx] = market;
  }

  async delete(id: string): Promise<void> {
    this.markets = this.markets.filter(m => m.id !== id);
  }
}