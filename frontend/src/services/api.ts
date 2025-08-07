import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access, redirecting to login...');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; nickname: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  checkNickname: (nickname: string) =>
    api.get(`/auth/check-nickname?nickname=${nickname}`),
  getMyTemperature: () => api.get('/temperature'),
};

// Post APIs
export const postAPI = {
  createPost: (data: { content: string }) =>
    api.post('/posts', data),
  getPosts: () => api.get('/posts'),
  getPost: (id: string) => api.get(`/posts/${id}`),
  updatePost: (id: string, data: { content: string }) =>
    api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
};

// Comment APIs
export const commentAPI = {
  createComment: (postId: string, data: { content: string }) =>
    api.post(`/posts/${postId}/comments`, data),
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  updateComment: (postId: string, commentId: string, data: { content: string }) =>
    api.put(`/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
};

// MyRoom APIs
export const myRoomAPI = {
  getMyRoom: (nickname: string) => api.get(`/myroom/${nickname}`),
  updateMyRoom: (nickname: string, data: any) =>
    api.put(`/myroom/${nickname}`, data),
  getMyRoomItems: (nickname: string) => api.get(`/myroom/${nickname}/items`),
};

// Follow APIs
export const followAPI = {
  followUser: (nickname: string) => api.post(`/follow/${nickname}`),
  unfollowUser: (nickname: string) => api.delete(`/follow/${nickname}`),
  getFollowings: (nickname: string) => api.get(`/follow/${nickname}/followings`),
  getFollowers: (nickname: string) => api.get(`/follow/${nickname}/followers`),
  getFeed: () => api.get('/feed'),
};

// Market APIs
export const marketAPI = {
  getMarketItems: () => api.get('/market'),
  getMarketItem: (id: string) => api.get(`/market/${id}`),
  createMarketItem: (data: any) => api.post('/market', data),
  updateMarketItem: (id: string, data: any) => api.put(`/market/${id}`, data),
  deleteMarketItem: (id: string) => api.delete(`/market/${id}`),
  getMarketItemsByCategory: (category: string) =>
    api.get(`/market?category=${category}`),
};

// Review APIs
export const reviewAPI = {
  createReview: (sellerNickname: string, data: any) =>
    api.post(`/reviews/${sellerNickname}`, data),
  getReviews: (sellerNickname: string) => api.get(`/reviews/${sellerNickname}`),
  updateReview: (reviewId: string, data: any) =>
    api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};

export default api;