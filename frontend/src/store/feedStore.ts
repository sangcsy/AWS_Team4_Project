import { create } from 'zustand';
import { postAPI, commentAPI, followAPI } from '../services/api';

interface Post {
  id: string;
  content: string;
  author: {
    nickname: string;
    temperature: number;
  };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    nickname: string;
    temperature: number;
  };
  createdAt: string;
}

interface FeedState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  getFeed: () => Promise<void>;
  createPost: (content: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<void>;
  getComments: (postId: string) => Promise<Comment[]>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  getFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await followAPI.getFeed();
      set({ posts: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '피드를 불러오는데 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  createPost: async (content: string) => {
    set({ isLoading: true, error: null });
    try {
      await postAPI.createPost({ content });
      // 새 게시글 생성 후 피드 새로고침
      await get().getFeed();
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '게시글 작성에 실패했습니다.', 
        isLoading: false 
      });
    }
  },
  likePost: async (postId: string) => {
    try {
      await postAPI.likePost(postId);
      // 좋아요 후 피드 새로고침
      await get().getFeed();
    } catch (error: any) {
      set({ error: '좋아요 처리에 실패했습니다.' });
    }
  },
  createComment: async (postId: string, content: string) => {
    try {
      await commentAPI.createComment(postId, { content });
      // 댓글 생성 후 피드 새로고침
      await get().getFeed();
    } catch (error: any) {
      set({ error: '댓글 작성에 실패했습니다.' });
    }
  },
  getComments: async (postId: string) => {
    try {
      const response = await commentAPI.getComments(postId);
      return response.data;
    } catch (error: any) {
      set({ error: '댓글을 불러오는데 실패했습니다.' });
      return [];
    }
  },
})); 