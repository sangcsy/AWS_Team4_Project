import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Post 타입 정의
interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  temperature_change: number;
  created_at: string;
  updated_at: string;
  category?: string;
  user?: {
    nickname: string;
    temperature: number;
    email: string;
  };
  likes?: number;
  isLiked?: boolean;
  comments?: Comment[];
  isFollowing?: boolean;
  isPopular?: boolean;
}

// Comment 타입 정의
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    nickname: string;
  };
}

interface UserProfile {
  user: {
    id: string;
    nickname: string;
    email: string;
    temperature: number;
    created_at: string;
  };
  stats: {
    total_posts: number;
    total_likes: number;
    total_followers: number;
    total_following: number;
  };
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'following'>('posts');

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserPosts();
      checkFollowStatus();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 프로필 로드 시작:', { userId, token: token ? '존재함' : '없음' });
      
      const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 프로필 API 응답:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 프로필 데이터:', data);
        if (data.success) {
          setProfile(data.data);
          console.log('✅ 프로필 로드 성공');
        } else {
          console.error('❌ 프로필 API 실패:', data.error);
        }
      } else {
        console.error('❌ 프로필 HTTP 오류:', response.status);
        const errorText = await response.text();
        console.error('❌ 오류 상세:', errorText);
      }
    } catch (error) {
      console.error('💥 프로필 로드 실패:', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/posts?page=1&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 해당 사용자의 게시글만 필터링
          const userPosts = data.data.posts.filter((post: any) => post.user_id === userId);
          setPosts(userPosts);
        }
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/follow/check/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsFollowing(data.data.isFollowing || false);
        }
      }
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = isFollowing ? 'DELETE' : 'POST';
      const url = isFollowing 
        ? `http://localhost:3000/api/follow/${userId}`
        : 'http://localhost:3000/api/follow';
      
      console.log('🔍 팔로우 토글 시작:', { userId, method, isFollowing, url });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'POST' ? JSON.stringify({ followingId: userId }) : undefined
      });

      console.log('📡 팔로우 API 응답:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 팔로우 응답 데이터:', data);
        
        setIsFollowing(!isFollowing);
        // 프로필 통계 업데이트
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              total_followers: isFollowing 
                ? prev.stats.total_followers - 1 
                : prev.stats.total_followers + 1
            }
          } : null);
        }
        console.log('✅ 팔로우 상태 업데이트 완료');
      } else {
        console.error('❌ 팔로우 HTTP 오류:', response.status);
        const errorText = await response.text();
        console.error('❌ 오류 상세:', errorText);
      }
    } catch (error) {
      console.error('💥 팔로우/언팔로우 실패:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}개월 전`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}년 전`;
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">로딩중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>사용자를 찾을 수 없습니다</h2>
        <button onClick={() => navigate(-1)}>뒤로 가기</button>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* 헤더 */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </button>
        <h1>{profile.user.nickname}님의 프로필</h1>
      </header>

      {/* 프로필 정보 */}
      <section className="profile-info card">
        <div className="profile-avatar">
          <div className="avatar-large">{profile.user.nickname.charAt(0)}</div>
        </div>
        
        <div className="profile-details">
          <h2 className="profile-name">{profile.user.nickname}</h2>
          <p className="profile-email">{profile.user.email}</p>
          <p className="profile-temperature">🔥 {profile.user.temperature}℃</p>
          <p className="profile-joined">
            가입일: {new Date(profile.user.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* 팔로우 버튼 (자신이 아닌 경우만) */}
        {currentUserId !== userId && (
          <button 
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={toggleFollow}
          >
            {isFollowing ? '👥 팔로잉' : '➕ 팔로우'}
          </button>
        )}
      </section>

      {/* 통계 */}
      <section className="profile-stats card">
        <div className="stat-item">
          <span className="stat-number">{profile.stats.total_posts}</span>
          <span className="stat-label">게시글</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.total_likes}</span>
          <span className="stat-label">받은 좋아요</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.total_followers}</span>
          <span className="stat-label">팔로워</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.total_following}</span>
          <span className="stat-label">팔로잉</span>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <section className="profile-tabs card">
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 게시글 ({profile.stats.total_posts})
        </button>
        <button 
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          ❤️ 좋아요 ({profile.stats.total_likes})
        </button>
        <button 
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          👥 팔로잉 ({profile.stats.total_following})
        </button>
      </section>

      {/* 탭 콘텐츠 */}
      <section className="tab-content">
        {activeTab === 'posts' && (
          <div className="posts-tab">
            {posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>아직 게시글이 없습니다</h3>
                <p>첫 번째 게시글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="posts-list">
                {posts.map(post => (
                  <article key={post.id} className="post-card card">
                    <div className="post-header">
                      <h3 className="post-title">{post.title}</h3>
                      <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <p className="post-content">{post.content}</p>
                    <div className="post-meta">
                      <span className="post-category">{post.category || '자유'}</span>
                      <span className="post-likes">❤️ {post.likes || 0}</span>
                      <span className="post-comments">💬 {post.comments?.length || 0}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="likes-tab">
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <h3>좋아요 기능 준비 중</h3>
              <p>곧 구현될 예정입니다!</p>
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-tab">
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>팔로잉 목록 기능 준비 중</h3>
              <p>곧 구현될 예정입니다!</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
