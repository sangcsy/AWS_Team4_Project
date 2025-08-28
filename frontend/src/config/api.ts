// API 설정 파일
export const API_CONFIG = {
  // 개발 환경
  development: {
    baseUrl: 'http://localhost:3000',
    uploadUrl: 'http://localhost:3000',
    wsUrl: 'http://localhost:3000'
  },
  // 프로덕션 환경 (AWS Lambda + API Gateway)
  production: {
    baseUrl: 'https://ji5mx6cms1.execute-api.us-east-1.amazonaws.com/prod',
    uploadUrl: 'https://ji5mx6cms1.execute-api.us-east-1.amazonaws.com/prod',
    wsUrl: 'https://ji5mx6cms1.execute-api.us-east-1.amazonaws.com/prod'
  }
};

// 현재 환경에 따른 API URL 반환
export const getApiUrl = () => {
  const env = import.meta.env.MODE || 'development';
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development;
};

// API 엔드포인트 헬퍼 함수들
export const API_ENDPOINTS = {
  // 사용자 관련
  users: {
    login: '/api/users/login',
    register: '/api/users/register',
    profile: (userId: string) => `/api/users/profile/${userId}`,
    search: '/api/users/search',
    getById: (userId: string) => `/api/users/${userId}`
  },
  
  // 게시글 관련
  posts: {
    list: '/api/posts',
    create: '/api/posts',
    getById: (postId: string) => `/api/posts/${postId}`,
    update: (postId: string) => `/api/posts/${postId}`,
    delete: (postId: string) => `/api/posts/${postId}`,
    like: (postId: string) => `/api/posts/${postId}/like`,
    comments: (postId: string) => `/api/posts/${postId}/comments`,
    search: '/api/posts/search'
  },
  
  // 업로드 관련
  upload: {
    image: '/api/upload/image'
  },
  
  // 팔로우 관련
  follow: {
    check: (userId: string) => `/api/follow/check/${userId}`,
    create: '/api/follow',
    followers: (userId: string) => `/api/follow/followers/${userId}`,
    following: (userId: string) => `/api/follow/following/${userId}`
  },
  
  // 알림 관련
  notifications: {
    list: '/api/notifications',
    unreadCount: '/api/notifications/unread-count',
    markRead: (notificationId: string) => `/api/notifications/${notificationId}/read`,
    markAllRead: '/api/notifications/mark-all-read',
    delete: (notificationId: string) => `/api/notifications/${notificationId}`
  },
  
  // 프로필 관련
  profiles: {
    get: (userId: string) => `/api/profiles/${userId}`,
    update: (userId: string) => `/api/profiles/${userId}`
  }
};

// 전체 URL 생성 헬퍼
export const createApiUrl = (endpoint: string) => {
  const config = getApiUrl();
  return `${config.baseUrl}${endpoint}`;
};

// WebSocket URL 생성
export const getWsUrl = () => {
  const config = getApiUrl();
  return config.wsUrl;
};
