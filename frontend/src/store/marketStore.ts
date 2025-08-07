import { create } from 'zustand';
import { marketAPI, reviewAPI } from '../services/api';

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  seller: {
    nickname: string;
    temperature: number;
    averageRating: number;
  };
  createdAt: string;
  images?: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    nickname: string;
    temperature: number;
  };
  createdAt: string;
}

interface MarketState {
  items: MarketItem[];
  selectedItem: MarketItem | null;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  getMarketItems: () => Promise<void>;
  getMarketItem: (id: string) => Promise<void>;
  createMarketItem: (data: any) => Promise<void>;
  getReviews: (sellerNickname: string) => Promise<void>;
  createReview: (sellerNickname: string, data: any) => Promise<void>;
  getMarketItemsByCategory: (category: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  items: [],
  selectedItem: null,
  reviews: [],
  isLoading: false,
  error: null,
  getMarketItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await marketAPI.getMarketItems();
      set({ items: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '마켓 상품을 불러오는데 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  getMarketItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await marketAPI.getMarketItem(id);
      set({ selectedItem: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '상품 정보를 불러오는데 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  createMarketItem: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      await marketAPI.createMarketItem(data);
      // 상품 생성 후 목록 새로고침
      await get().getMarketItems();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '상품 등록에 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  getReviews: async (sellerNickname: string) => {
    try {
      const response = await reviewAPI.getReviews(sellerNickname);
      set({ reviews: response.data });
    } catch (error: any) {
      set({ error: '후기를 불러오는데 실패했습니다.' });
    }
  },
  createReview: async (sellerNickname: string, data: any) => {
    try {
      await reviewAPI.createReview(sellerNickname, data);
      // 후기 생성 후 목록 새로고침
      await get().getReviews(sellerNickname);
    } catch (error: any) {
      set({ error: '후기 작성에 실패했습니다.' });
    }
  },
  getMarketItemsByCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await marketAPI.getMarketItemsByCategory(category);
      set({ items: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '카테고리별 상품을 불러오는데 실패했습니다.', 
        isLoading: false 
      });
    }
  },
})); 