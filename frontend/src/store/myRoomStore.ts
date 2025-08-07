import { create } from 'zustand';
import { myRoomAPI, followAPI } from '../services/api';

interface MyRoomItem {
  id: string;
  name: string;
  description: string;
  type: 'decoration' | 'badge' | 'theme';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MyRoomProfile {
  nickname: string;
  temperature: number;
  description: string;
  followers: number;
  followings: number;
  items: MyRoomItem[];
  isFollowing?: boolean;
}

interface MyRoomState {
  profile: MyRoomProfile | null;
  isLoading: boolean;
  error: string | null;
  getMyRoom: (nickname: string) => Promise<void>;
  followUser: (nickname: string) => Promise<void>;
  unfollowUser: (nickname: string) => Promise<void>;
  updateMyRoom: (nickname: string, data: any) => Promise<void>;
}

export const useMyRoomStore = create<MyRoomState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  getMyRoom: async (nickname: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await myRoomAPI.getMyRoom(nickname);
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '마이룸을 불러오는데 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  followUser: async (nickname: string) => {
    try {
      await followAPI.followUser(nickname);
      // 팔로우 후 프로필 새로고침
      await get().getMyRoom(nickname);
    } catch (error: any) {
      set({ error: '팔로우 처리에 실패했습니다.' });
    }
  },
  unfollowUser: async (nickname: string) => {
    try {
      await followAPI.unfollowUser(nickname);
      // 언팔로우 후 프로필 새로고침
      await get().getMyRoom(nickname);
    } catch (error: any) {
      set({ error: '언팔로우 처리에 실패했습니다.' });
    }
  },
  updateMyRoom: async (nickname: string, data: any) => {
    try {
      await myRoomAPI.updateMyRoom(nickname, data);
      // 업데이트 후 프로필 새로고침
      await get().getMyRoom(nickname);
    } catch (error: any) {
      set({ error: '프로필 업데이트에 실패했습니다.' });
    }
  },
})); 