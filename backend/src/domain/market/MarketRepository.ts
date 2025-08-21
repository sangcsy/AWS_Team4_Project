import { Market } from './Market';

export interface MarketRepository {
  findById(id: string): Promise<Market | null>;
  findAll(): Promise<Market[]>;
  save(market: Market): Promise<void>;
  update(market: Market): Promise<void>;
  delete(id: string): Promise<void>;
}