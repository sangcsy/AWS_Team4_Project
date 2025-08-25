import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './UserProfile.css';

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
    total_likes_given: number;    // 좋아요
    total_followers: number;
    total_following: number;
  };
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [followersUsers, setFollowersUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'followers' | 'following'>('posts');
  
  // 정렬 상태
  const [postsSortBy, setPostsSortBy] = useState<'latest' | 'likes'>('latest');
  const [likesSortBy, setLikesSortBy] = useState<'latest' | 'likes'>('latest');

  const currentUserId = localStorage.getItem('userId');
  
  // 좋아요한 게시글 ID 목록을 로컬 스토리지에서 복원
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // 로컬 스토리지에서 좋아요한 게시글 ID 목록 복원
  useEffect(() => {
    const savedLikedIds = localStorage.getItem(`likedPosts_${currentUserId}`);
    if (savedLikedIds) {
      try {
        const parsedIds = JSON.parse(savedLikedIds);
        setLikedPostIds(new Set(parsedIds));
      } catch (error) {
        console.error('좋아요 ID 파싱 실패:', error);
      }
    }
  }, [currentUserId]);
  
  // 좋아요 상태 변경 감지 (localStorage 변경 이벤트)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `likedPosts_${currentUserId}` && e.newValue) {
        try {
          const parsedIds = JSON.parse(e.newValue);
          setLikedPostIds(new Set(parsedIds));
        } catch (error) {
          console.error('좋아요 ID 파싱 실패:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId]);

  // 프로필 상태 변경 감지 (디버깅용)
  useEffect(() => {
    if (profile) {
      console.log('📊 프로필 통계 업데이트됨:', profile.stats);
    }
  }, [profile]);

  // 좋아요 상태를 로컬 스토리지에 저장
  const saveLikedPostIds = (postIds: string[]) => {
    if (currentUserId) {
      localStorage.setItem(`likedPosts_${currentUserId}`, JSON.stringify(postIds));
    }
  };

  // 좋아요 토글 함수
  const toggleLike = (postId: string) => {
    const newLikedIds = new Set(likedPostIds);
    
    if (newLikedIds.has(postId)) {
      newLikedIds.delete(postId);
    } else {
      newLikedIds.add(postId);
    }
    
    setLikedPostIds(newLikedIds);
    saveLikedPostIds(Array.from(newLikedIds));
    
    // 좋아요한 게시글 목록 업데이트
    if (newLikedIds.has(postId)) {
      // 좋아요 추가
      const postToAdd = posts.find(post => post.id === postId);
      if (postToAdd) {
        setLikedPosts(prev => [...prev, postToAdd]);
      }
    } else {
      // 좋아요 제거
      setLikedPosts(prev => prev.filter(post => post.id !== postId));
    }
    
    // 통계 업데이트 (한 번만)
    setProfile(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        total_likes_given: newLikedIds.size
      }
    } : null);
  };

  useEffect(() => {
    if (userId) {
      // 순서대로 실행하여 상태 충돌 방지
      const initializeProfile = async () => {
        await loadUserProfile(); // 프로필 기본 정보 먼저 로드
        await loadUserPosts();   // 게시글 로드
        await loadLikedPosts();  // 좋아요한 게시글 로드 (통계 포함)
        await loadFollowersUsers(); // 팔로워 로드
        await loadFollowingUsers();  // 팔로잉 로드
        await checkFollowStatus();   // 팔로우 상태 확인
      };
      
      initializeProfile();
    }
  }, [userId]);

    const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          let profileData = data.data;
          
          // 백엔드 응답 구조에 따라 데이터 정리
          if (profileData && profileData.user && profileData.user.user) {
            profileData = {
              user: profileData.user.user,
              stats: profileData.user.stats || profileData.stats
            };
          }
           
                     // 통계 정보가 있는지 확인
           if (profileData && profileData.stats) {
             // 기본 통계 정보로 초기화 (나중에 실제 값으로 업데이트)
             const initialProfile = {
               ...profileData,
               stats: {
                 total_posts: 0,
                 total_likes_given: 0,
                 total_followers: 0,
                 total_following: 0,
                 ...profileData.stats
               }
             };
             setProfile(initialProfile);
           } else {
             // 기본 통계 정보로 설정
             const profileWithDefaultStats = {
               user: profileData?.user || { id: userId, nickname: '사용자', email: '', temperature: 36.5, created_at: new Date() },
               stats: {
                 total_posts: 0,
                 total_likes_given: 0,
                 total_followers: 0,
                 total_following: 0
               }
             };
             setProfile(profileWithDefaultStats);
           }
           
          // 통계 정보는 별도 함수에서 순차적으로 로드
        } else {
          console.error('프로필 API 실패:', data.error);
        }
      } else {
        console.error('프로필 HTTP 오류:', response.status);
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  // 프로필 통계 정보는 각 함수에서 직접 업데이트하도록 변경됨

  const loadUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/posts?page=1&limit=1000`, {
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
          
          // 게시글 수를 통계에 반영
          console.log('📝 게시글 수 업데이트:', userPosts.length);
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              total_posts: userPosts.length
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLikedPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 로컬 스토리지에서 좋아요한 게시글 ID 목록 가져오기
      const savedLikedIds = localStorage.getItem(`likedPosts_${currentUserId}`);
      let likedIds: string[] = [];
      
      if (savedLikedIds) {
        try {
          likedIds = JSON.parse(savedLikedIds);
        } catch (error) {
          console.error('좋아요 ID 파싱 실패:', error);
        }
      }

      if (likedIds.length === 0) {
        setLikedPosts([]);
        // 좋아요 수를 0으로 설정
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            total_likes_given: 0
          }
        } : null);
        return;
      }

      // 좋아요한 게시글 ID로 게시글 정보 가져오기
      const response = await fetch(`http://localhost:3000/api/posts?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 로컬 스토리지의 좋아요 ID와 매칭되는 게시글만 필터링
          const userLikedPosts = data.data.posts.filter((post: any) => 
            likedIds.includes(post.id)
          );
          
          setLikedPosts(userLikedPosts);
          
          // 좋아요한 게시글 수를 통계에 반영 (한 번만 업데이트)
          console.log('❤️ 좋아요 수 업데이트:', userLikedPosts.length);
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              total_likes_given: userLikedPosts.length
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('좋아요한 게시글 로드 실패:', error);
    }
  };

    const loadFollowersUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/follow/followers/${userId}?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const followers = data.data.follows || [];
          
          // 팔로워 사용자들의 상세 정보 가져오기
          const followersWithDetails = await Promise.all(
            followers.map(async (follower: any) => {
              try {
                const userResponse = await fetch(`http://localhost:3000/api/users/${follower.follower_id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  if (userData.success && userData.data) {
                    return {
                      ...follower,
                      nickname: userData.data.nickname || `사용자 ${follower.follower_id.substring(0, 8)}`,
                      temperature: userData.data.temperature || 36.5
                    };
                  }
                }
                return follower;
              } catch (error) {
                console.error('사용자 정보 로드 실패:', error);
                return follower;
              }
            })
          );
          
          setFollowersUsers(followersWithDetails);
          
          // 팔로워 수를 통계에 반영
          console.log('👤 팔로워 수 업데이트:', followersWithDetails.length);
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              total_followers: followersWithDetails.length
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('팔로워 사용자 로드 실패:', error);
    }
  };

  const loadFollowingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/follow/following/${userId}?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const follows = data.data.follows || [];
          
          // 팔로잉 사용자들의 상세 정보 가져오기
          const followingWithDetails = await Promise.all(
            follows.map(async (follow: any) => {
              try {
                const userResponse = await fetch(`http://localhost:3000/api/users/${follow.following_id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  if (userData.success && userData.data) {
                    return {
                      ...follow,
                      nickname: userData.data.nickname || `사용자 ${follow.following_id.substring(0, 8)}`,
                      temperature: userData.data.temperature || 36.5
                    };
                  }
                }
                return follow;
              } catch (error) {
                console.error('사용자 정보 로드 실패:', error);
                return follow;
              }
            })
          );
          
          setFollowingUsers(followingWithDetails);
          
          // 팔로잉 수를 통계에 반영
          console.log('👥 팔로잉 수 업데이트:', followingWithDetails.length);
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              total_following: followingWithDetails.length
            }
          } : null);
        }
      }
    } catch (error) {
      console.error('팔로잉 사용자 로드 실패:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/follow/check/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const isFollowingStatus = data.data.is_following || false;
          setIsFollowing(isFollowingStatus);
        }
      } else {
        console.error('팔로우 상태 확인 실패:', response.status);
      }
    } catch (error) {
      console.error('팔로우 상태 확인 오류:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 팔로우 상태 재확인 (최신 상태 반영)
      await checkFollowStatus();
      
      const method = isFollowing ? 'DELETE' : 'POST';
      const url = isFollowing 
        ? `http://localhost:3000/api/follow/${userId}`
        : 'http://localhost:3000/api/follow';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: method === 'POST' ? JSON.stringify({ followingId: userId }) : undefined
      });

      if (response.ok) {
        const data = await response.json();
        
        setIsFollowing(!isFollowing);
        // 프로필 통계 업데이트 (안전하게)
        if (profile && profile.stats) {
          setProfile(prev => {
            if (!prev || !prev.stats) return prev;
            
            return {
              ...prev,
              stats: {
                ...prev.stats,
                total_followers: isFollowing 
                  ? Math.max(0, prev.stats.total_followers - 1)  // 음수 방지
                  : prev.stats.total_followers + 1
              }
            };
          });
        }
      } else {
        console.error('팔로우 HTTP 오류:', response.status);
      }
    } catch (error) {
      console.error('팔로우/언팔로우 실패:', error);
    }
  };

  // 정렬 함수들
  const sortPosts = (posts: Post[], sortBy: 'latest' | 'likes') => {
    const sortedPosts = [...posts];
    switch (sortBy) {
      case 'latest':
        return sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'likes':
        return sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return sortedPosts;
    }
  };

  const sortUsers = (users: any[]) => {
    return [...users].sort((a, b) => {
      const nicknameA = a.nickname || `사용자 ${a.following_id || a.follower_id}`;
      const nicknameB = b.nickname || `사용자 ${b.following_id || b.follower_id}`;
      return nicknameA.localeCompare(nicknameB, 'ko');
    });
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
          <div className="avatar-large">{profile.user?.nickname?.charAt(0) || '?'}</div>
        </div>
        
        <div className="profile-details">
          <h2 className="profile-name">{profile.user?.nickname || '사용자'}</h2>
          <p className="profile-email">{profile.user?.email || '이메일 없음'}</p>
          <p className="profile-temperature">🔥 {profile.user?.temperature || 36.5}℃</p>
          <p className="profile-joined">
            가입일: {profile.user?.created_at ? new Date(profile.user.created_at).toLocaleDateString() : '알 수 없음'}
          </p>
        </div>

                 {/* 팔로우 버튼 (자신이 아닌 경우만) */}
         {currentUserId !== userId && (
           <button 
             className={`follow-btn ${isFollowing ? 'following' : ''}`}
             onClick={toggleFollow}
           >
             {isFollowing ? '❌ 팔로우 취소' : '➕ 팔로우'}
           </button>
         )}
      </section>

             {/* 통계 */}
       <section className="profile-stats card">
         <div className="stat-item">
           <span className="stat-number">{profile.stats?.total_posts || 0}</span>
           <span className="stat-label">게시글</span>
         </div>

                   <div className="stat-item">
            <span className="stat-number">{profile.stats?.total_likes_given || 0}</span>
            <span className="stat-label">좋아요</span>
          </div>
         <div className="stat-item">
           <span className="stat-number">{profile.stats?.total_followers || 0}</span>
           <span className="stat-label">팔로워</span>
         </div>
         <div className="stat-item">
           <span className="stat-number">{profile.stats?.total_following || 0}</span>
           <span className="stat-label">팔로잉</span>
         </div>
       </section>

      {/* 탭 네비게이션 */}
      <section className="profile-tabs card">
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 게시글 ({profile.stats?.total_posts || 0})
        </button>
                          <button 
           className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
           onClick={() => setActiveTab('likes')}
         >
           ❤️ 좋아요 ({profile.stats?.total_likes_given || 0})
         </button>
         <button 
           className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
           onClick={() => setActiveTab('followers')}
         >
           👤 팔로워 ({profile.stats?.total_followers || 0})
         </button>
         <button 
           className={`tab ${activeTab === 'following' ? 'active' : ''}`}
           onClick={() => setActiveTab('following')}
         >
           👥 팔로잉 ({profile.stats?.total_following || 0})
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
               <>
                 <div className="sort-controls">
                   <button 
                     className={`sort-btn ${postsSortBy === 'latest' ? 'active' : ''}`}
                     onClick={() => setPostsSortBy('latest')}
                   >
                     최신순
                   </button>
                   <button 
                     className={`sort-btn ${postsSortBy === 'likes' ? 'active' : ''}`}
                     onClick={() => setPostsSortBy('likes')}
                   >
                     좋아요순
                   </button>
                 </div>
                 <div className="posts-list">
                   {sortPosts(posts, postsSortBy).map(post => (
                     <article key={post.id} className="post-card card">
                       <div className="post-header">
                         <h3 className="post-title">{post.title}</h3>
                         <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                       </div>
                       <p className="post-content">{post.content}</p>
                       <div className="post-meta">
                         <span className="post-category">{post.category || '자유'}</span>
                         <button 
                           className={`like-btn ${likedPostIds.has(post.id) ? 'liked' : ''}`}
                           onClick={() => toggleLike(post.id)}
                         >
                           {likedPostIds.has(post.id) ? '❤️' : '🤍'} {post.likes || 0}
                         </button>
                         <span className="post-comments">💬 {post.comments?.length || 0}</span>
                       </div>
                     </article>
                   ))}
                 </div>
               </>
             )}
           </div>
         )}

                 {activeTab === 'likes' && (
           <div className="likes-tab">
             {likedPosts.length === 0 ? (
               <div className="empty-state">
                 <div className="empty-icon">❤️</div>
                 <h3>아직 좋아요한 게시글이 없습니다</h3>
                 <p>마음에 드는 게시글에 좋아요를 눌러보세요!</p>
               </div>
             ) : (
               <>
                 <div className="sort-controls">
                   <button 
                     className={`sort-btn ${likesSortBy === 'latest' ? 'active' : ''}`}
                     onClick={() => setLikesSortBy('latest')}
                   >
                     최신순
                   </button>
                   <button 
                     className={`sort-btn ${likesSortBy === 'likes' ? 'active' : ''}`}
                     onClick={() => setLikesSortBy('likes')}
                   >
                     좋아요순
                   </button>
                 </div>
                 <div className="liked-posts-list">
                   {sortPosts(likedPosts, likesSortBy).map(post => (
                     <article key={post.id} className="liked-post-item card">
                       <div className="post-header">
                         <h3 className="post-title">{post.title}</h3>
                         <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                       </div>
                       <p className="post-content">{post.content}</p>
                       <div className="post-meta">
                         <span className="post-category">{post.category || '자유'}</span>
                         <button 
                           className={`like-btn liked`}
                           onClick={() => toggleLike(post.id)}
                         >
                           ❤️ {post.likes || 0}
                         </button>
                         <span className="post-comments">💬 {post.comments?.length || 0}</span>
                       </div>
                     </article>
                   ))}
                 </div>
               </>
             )}
           </div>
         )}

                 {activeTab === 'followers' && (
           <div className="followers-tab">
             {followersUsers.length === 0 ? (
               <div className="empty-state">
                 <div className="empty-icon">👤</div>
                 <h3>아직 팔로워가 없습니다</h3>
                 <p>다른 사용자들이 당신을 팔로우할 때 여기에 표시됩니다!</p>
               </div>
             ) : (
               <div className="followers-users-list">
                 {sortUsers(followersUsers).map(user => (
                   <div key={user.follower_id} className="follower-user-item card">
                     <div className="user-avatar">
                       <div className="avatar-small">{user.nickname?.charAt(0) || '?'}</div>
                     </div>
                     <div className="user-info">
                       <h3 className="user-nickname">{user.nickname || `사용자 ${user.follower_id.substring(0, 8)}`}</h3>
                       <p className="user-temperature">🔥 {user.temperature || 36.5}℃</p>
                     </div>
                     <button 
                       className="visit-profile-btn"
                       onClick={() => navigate(`/profile/${user.follower_id}`)}
                     >
                       프로필 보기
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}

         {activeTab === 'following' && (
           <div className="following-tab">
             {followingUsers.length === 0 ? (
               <div className="empty-state">
                 <div className="empty-icon">👥</div>
                 <h3>아직 팔로잉하는 사용자가 없습니다</h3>
                 <p>관심 있는 사용자를 팔로우해보세요!</p>
               </div>
             ) : (
               <div className="following-users-list">
                 {sortUsers(followingUsers).map(user => (
                   <div key={user.following_id} className="following-user-item card">
                     <div className="user-avatar">
                       <div className="avatar-small">{user.nickname?.charAt(0) || '?'}</div>
                     </div>
                     <div className="user-info">
                       <h3 className="user-nickname">{user.nickname || `사용자 ${user.following_id.substring(0, 8)}`}</h3>
                       <p className="user-temperature">🔥 {user.temperature || 36.5}℃</p>
                     </div>
                     <button 
                       className="visit-profile-btn"
                       onClick={() => navigate(`/profile/${user.following_id}`)}
                     >
                       프로필 보기
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         )}
      </section>
    </div>
  );
}
