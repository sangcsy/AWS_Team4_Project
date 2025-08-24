import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useParams } from 'react-router-dom';
import UserProfile from './UserProfile';
import NotificationBell from '../components/NotificationBell';
import './MainApp.css';

type Post = {
  id: string
  user_id: string
  title: string
  content: string
  temperature_change: number
  created_at: string
  updated_at: string
  category?: string
  user?: {
    nickname: string
    temperature: number
    email: string
  }
  likes?: number
  isLiked?: boolean
  comments?: Comment[]
  isFollowing?: boolean // 팔로워 게시글인지 표시
  isPopular?: boolean // 인기게시글인지 표시 (좋아요 5개 이상)
}

type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    nickname: string
  }
}

// 카테고리 상수
const CATEGORIES = ['자유', '장터', '홍보', '진로', '랜덤채팅']

export default function MainApp() {
  const navigate = useNavigate()
  
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // 피드 데이터 상태
  const [posts, setPosts] = useState<Post[]>([])
  
  // 사이드바 작성 상태
  const [draftText, setDraftText] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftCat, setDraftCat] = useState(CATEGORIES[0])
  const [isLoading, setIsLoading] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  
  // 댓글 관련 상태
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // 카테고리 필터링 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  
  // 정렬 상태
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'temperature'>('latest')
  
  // 해시태그 관련 상태
  const [hashtags, setHashtags] = useState<string[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([])
  
  // 팔로잉 관련 상태
  const [followingList, setFollowingList] = useState<string[]>([]) // 내가 팔로우하는 사용자 ID 목록
  const [followersList, setFollowersList] = useState<string[]>([]) // 나를 팔로우하는 사용자 ID 목록
  const [isFollowingLoading, setIsFollowingLoading] = useState(false)
  
  // 사용자 검색 관련 상태
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<any[]>([])
  const [isUserSearching, setIsUserSearching] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  
  // 메뉴 상태 관리
  const [activeMenu, setActiveMenu] = useState<'home' | 'following' | 'community' | 'myposts'>('home')
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>('전체')

  // 인증 체크 및 사용자 정보 로드
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userNickname = localStorage.getItem('userNickname')
    const userEmail = localStorage.getItem('userEmail')
    
    if (!token || !userId) {
      navigate('/')
      return
    }
    
    setIsAuthenticated(true)
    
    // 로컬 스토리지에 사용자 정보가 있으면 바로 사용
    if (userNickname && userEmail) {
      console.log('✅ 로컬 스토리지에서 사용자 정보 로드:', { userNickname, userEmail })
      const userInfo = {
        id: userId,
        nickname: userNickname,
        email: userEmail,
        temperature: 36.5
      }
      setCurrentUser(userInfo)
      
      // 사용자 정보 설정 후 팔로잉 데이터와 홈피드 로드
      loadFollowingData().then(() => {
        loadHomeFeed()
      })
    } else {
      console.log('⚠️ 로컬 스토리지에 사용자 정보 없음, API에서 가져오기 시도')
      // 없으면 기본값으로 설정하고 API에서 가져오기 시도
      const userInfo = {
        id: userId,
        nickname: '사용자',
        email: '이메일 정보 없음',
        temperature: 36.5
      }
      setCurrentUser(userInfo)
      
      // API에서 사용자 정보 가져오기
      loadUserInfo()
    }
  }, [navigate])

  // 사용자 상세 정보 로드
  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) return
      
      // API에서 정보 가져오기
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const userInfo = {
            id: userId,
            nickname: data.data.nickname,
            email: data.data.email,
            temperature: data.data.temperature || 36.5
          }
          
          // 로컬 스토리지에 저장
          localStorage.setItem('userNickname', userInfo.nickname)
          localStorage.setItem('userEmail', userInfo.email)
          
          setCurrentUser(userInfo)
          
          // 사용자 정보 설정 후 팔로잉 데이터와 홈피드 로드
          loadFollowingData().then(() => {
            loadHomeFeed()
          })
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
      
      // 에러 시 기본값 설정
      const userInfo = {
        id: localStorage.getItem('userId') || '',
        nickname: '사용자',
        email: '이메일 정보 없음',
        temperature: 36.5
      }
      setCurrentUser(userInfo)
      
      // 에러 시에도 홈피드 로드 시도
      loadHomeFeed()
    }
  }

  // 로그인 성공 시 사용자 정보 저장 (외부에서 호출 가능)
  const setUserInfo = (nickname: string, email: string) => {
    localStorage.setItem('userNickname', nickname)
    localStorage.setItem('userEmail', email)
    
    setCurrentUser((prev: any) => ({
      ...prev,
      nickname,
      email
    }))
  }

  // 게시글 로드 후 트렌딩 해시태그 업데이트
  useEffect(() => {
    if (posts.length > 0) {
      updateTrendingHashtags()
    }
  }, [posts])

  // 홈피드 데이터 로드 (팔로우한 사람 + 인기 게시물, 내 게시물 제외)
  const loadHomeFeed = async () => {
    try {
      // home-feed API가 존재하지 않으므로 바로 기본 홈피드 로드
      console.log('⚠️ home-feed API가 존재하지 않음, 기본 홈피드 로드로 대체')
      await loadDefaultHomeFeed()
    } catch (error) {
      console.error('홈피드 로드 실패:', error)
      // 에러 시 기본 게시글 로드 (내 게시물 제외)
      await loadDefaultHomeFeed()
    }
  }

  // 기본 홈피드 데이터 로드 (팔로워가 없거나 API 실패 시)
  const loadDefaultHomeFeed = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/posts?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('🔍 기본 홈피드 로드 - 전체 게시글:', data.data.posts)
          console.log('🔍 현재 사용자 ID:', currentUser?.id)
          console.log('🔍 현재 사용자 정보:', currentUser)
          
          if (!currentUser?.id) {
            console.error('❌ currentUser.id가 설정되지 않음!')
            return
          }
          
          // 내 게시물 제외하고 인기게시글(좋아요 5개 이상)과 팔로워 게시글 구분
          const filteredPosts = data.data.posts
            .filter((post: any) => {
              const isMyPost = post.user_id === currentUser.id
              console.log(`게시글 ${post.id}: user_id=${post.user_id}, currentUser.id=${currentUser.id}, 내게시글=${isMyPost}`)
              return !isMyPost // 내 게시물이 아닌 것만 반환
            })
            .map((post: any) => {
              // 인기게시글 여부 판단 (좋아요 5개 이상)
              const isPopular = (post.likes || 0) >= 5
              // 팔로잉 상태 확인
              const isFollowing = followingList.includes(post.user_id)
              return {
                ...post,
                isPopular,
                isFollowing
              }
            })
            .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0)) // 좋아요 순 정렬
            .map(transformPostData)
          
          console.log('✅ 기본 홈피드 필터링 결과:', filteredPosts)
          console.log('✅ 필터링된 게시글 개수:', filteredPosts.length)
          
          setPosts(filteredPosts)
          setFilteredPosts(filteredPosts)
        }
      }
    } catch (error) {
      console.error('기본 홈피드 로드 실패:', error)
    }
  }

  // 게시글 조회 (기본 함수 - 내 게시글 포함)
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 게시글 조회 시작...')
      console.log('🔑 Token:', token ? '존재함' : '없음')
      
      const response = await fetch('http://localhost:3000/api/posts?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 API 응답 데이터:', data)
      
      if (data.success) {
        console.log('✅ 게시글 조회 성공!')
        console.log('📝 게시글 개수:', data.data?.posts?.length || 0)
        
        if (data.data && data.data.posts && Array.isArray(data.data.posts)) {
          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const transformedPosts = data.data.posts.map(transformPostData)
          
          console.log('🎯 변환된 게시글:', transformedPosts)
          
          // 현재 메뉴에 따라 적절한 필터링 적용
          if (activeMenu === 'home') {
            // 홈피드에서는 내 게시글 제외
            const filteredPosts = transformedPosts.filter((post: any) => post.user_id !== currentUser?.id)
            console.log('🏠 홈피드 필터링 - 내 게시글 제외:', filteredPosts)
            setPosts(filteredPosts)
            setFilteredPosts(filteredPosts)
          } else {
            // 커뮤니티에서는 모든 게시글 표시
            console.log('💬 커뮤니티 - 모든 게시글 표시:', transformedPosts)
            setPosts(transformedPosts)
            setFilteredPosts(transformedPosts)
          }
        } else {
          console.log('⚠️ data.data.posts가 배열이 아님:', data.data)
          setPosts([])
        }
      } else {
        console.log('❌ API 응답 실패:', data.error || '알 수 없는 오류')
        setPosts([])
      }
    } catch (error) {
      console.error('💥 게시글 조회 실패:', error)
      setPosts([])
    }
  }

  // 내 게시글 데이터 로드
  const loadMyPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/posts?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('🔍 내 게시글 로드 - 전체 게시글:', data.data.posts)
          console.log('🔍 현재 사용자 ID:', currentUser?.id)
          
          if (!currentUser?.id) {
            console.error('❌ currentUser.id가 설정되지 않음!')
            return
          }
          
          // 내 게시글만 필터링
          const myPosts = data.data.posts
            .filter((post: any) => {
              const isMyPost = post.user_id === currentUser.id
              console.log(`게시글 ${post.id}: user_id=${post.user_id}, currentUser.id=${currentUser.id}, 내게시글=${isMyPost}`)
              return isMyPost // 내 게시글만 반환
            })
            .map(transformPostData)
          
          console.log('✅ 내 게시글 필터링 결과:', myPosts)
          console.log('✅ 내 게시글 개수:', myPosts.length)
          
          setPosts(myPosts)
          setFilteredPosts(myPosts)
        }
      }
    } catch (error) {
      console.error('내 게시글 로드 실패:', error)
    }
  }

  const handlePost = async () => {
    const text = draftText.trim()
    const title = draftTitle.trim()
    if (!text || !title) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: text,
          category: draftCat,
          temperature_change: 0
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ 게시글 작성 성공!')
        
        // 홈피드인 경우 홈피드 새로고침 (내 게시물 제외), 아니면 일반 게시글 새로고침
        if (activeMenu === 'home') {
          await loadHomeFeed() // 내 게시물 제외된 홈피드 로드
        } else if (activeMenu === 'myposts') {
          await loadMyPosts() // 내 게시글만 로드
        } else {
          await fetchPosts() // 커뮤니티에서는 모든 게시글 표시
        }
        
        setDraftText('')
        setDraftTitle('')
        
        // 해시태그 추출 및 트렌딩 업데이트
        const newHashtags = extractHashtags(text)
        setHashtags(newHashtags)
        updateTrendingHashtags()
      } else {
        console.log('❌ 게시글 작성 실패:', data.error)
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 게시글 수정
  const handleEditPost = async (postId: string) => {
    if (!editText.trim() || !editTitle.trim()) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          content: editText
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 게시글 목록 업데이트 (posts와 filteredPosts 모두)
        const updatedPosts = posts.map(post => 
          post.id === postId 
            ? { ...post, title: editTitle, content: editText }
            : post
        )
        
        const updatedFilteredPosts = filteredPosts.map(post => 
          post.id === postId 
            ? { ...post, title: editTitle, content: editText }
            : post
        )
        
        setPosts(updatedPosts)
        setFilteredPosts(updatedFilteredPosts)
        
        setEditingPostId(null)
        setEditText('')
        setEditTitle('')
        setEditCategory('')
        
        console.log('✅ 게시글 수정 완료')
      }
    } catch (error) {
      console.error('게시글 수정 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 게시글 삭제
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 게시글 목록에서 제거 (posts와 filteredPosts 모두)
        const updatedPosts = posts.filter(post => post.id !== postId)
        const updatedFilteredPosts = filteredPosts.filter(post => post.id !== postId)
        
        setPosts(updatedPosts)
        setFilteredPosts(updatedFilteredPosts)
        
        console.log('✅ 게시글 삭제 완료')
      }
    } catch (error) {
      console.error('게시글 삭제 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 수정 모드 시작
  const startEdit = (post: Post) => {
    setEditingPostId(post.id)
    setEditText(post.content)
    setEditTitle(post.title)
    setEditCategory('자유') // 기본값
  }

  // 수정 모드 취소
  const cancelEdit = () => {
    setEditingPostId(null)
    setEditText('')
    setEditTitle('')
    setEditCategory('')
  }

  // 좋아요 토글
  const toggleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('좋아요 응답:', data)
        
        if (data.success) {
          // 좋아요 상태 업데이트 (posts와 filteredPosts 모두)
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                isLiked: data.data.liked,
                likes: data.data.likes
              }
            }
            return post
          })
          
          const updatedFilteredPosts = filteredPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                isLiked: data.data.liked,
                likes: data.data.likes
              }
            }
            return post
          })
          
          setPosts(updatedPosts)
          setFilteredPosts(updatedFilteredPosts)
          
          console.log('✅ 좋아요 상태 업데이트 완료:', {
            postId,
            liked: data.data.liked,
            likes: data.data.likes
          })
        } else {
          console.error('❌ 좋아요 처리 실패:', data.error)
        }
      } else {
        console.error('❌ 좋아요 API 오류:', response.status)
      }
    } catch (error) {
      console.error('💥 좋아요 처리 실패:', error)
    }
  }

  // 댓글 작성
  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: commentText
        })
      })

      if (response.ok) {
        // 댓글 추가 후 게시글 목록 새로고침
        await fetchPosts()
        setCommentText('')
        setReplyingTo(null)
        
        console.log('✅ 댓글 작성 완료')
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error)
    }
  }

  // 댓글 표시
  const renderComments = (post: Post) => {
    if (!post.comments || post.comments.length === 0) return null

    return (
      <div className="comments-section">
        <h4>댓글 ({post.comments.length})</h4>
        {post.comments.map((comment: Comment) => (
          <div key={comment.id} className="comment">
            <strong>{comment.user?.nickname || '알 수 없음'}</strong>
            <span>{comment.content}</span>
            <small>{formatTimeAgo(comment.created_at)}</small>
          </div>
        ))}
      </div>
    )
  }

  // 시간 가독성 개선 함수
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}개월 전`
    
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears}년 전`
  }

  // 검색 함수
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/posts/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.data.posts || [])
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('검색 실패:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 검색 결과 초기화
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }

  // 카테고리 필터링 함수
  const filterByCategory = (category: string) => {
    setSelectedCategory(category)
    if (category === '전체') {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter(post => post.category === category)
      setFilteredPosts(filtered)
    }
  }

  // 게시글 데이터 변환 함수
  const transformPostData = (post: any) => {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      user_id: post.user_id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      temperature_change: post.temperature_change || 0,
      likes: post.likes || 0,
      isLiked: post.isLiked || false,
      comments: post.comments || [],
      isFollowing: post.isFollowing || false, // 팔로워 게시글인지 표시
      isPopular: post.isPopular || false, // 인기게시글인지 표시
      user: post.user || null
    }
  }

  // 게시글 정렬 함수
  const sortPosts = (sortType: 'latest' | 'popular' | 'temperature') => {
    setSortBy(sortType)
    let sortedPosts = [...posts] // posts를 기반으로 정렬
    
    switch (sortType) {
      case 'latest':
        sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case 'temperature':
        sortedPosts.sort((a, b) => (b.user?.temperature || 0) - (a.user?.temperature || 0))
        break
    }
    
    setFilteredPosts(sortedPosts)
  }

  // 해시태그 추출 함수
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w가-힣]+/g
    return text.match(hashtagRegex) || []
  }

  // 해시태그 클릭 시 검색
  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag)
    handleSearch()
  }

  // 트렌딩 해시태그 업데이트
  const updateTrendingHashtags = () => {
    const allHashtags: string[] = []
    posts.forEach(post => {
      const postHashtags = extractHashtags(post.content)
      allHashtags.push(...postHashtags)
    })
    
    // 해시태그 빈도 계산
    const hashtagCount: { [key: string]: number } = {}
    allHashtags.forEach(tag => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
    })
    
    // 상위 5개 해시태그 추출
    const trending = Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)
    
    setTrendingHashtags(trending)
  }

  // 팔로잉/팔로워 데이터 로드
  const loadFollowingData = async () => {
    try {
      setIsFollowingLoading(true)
      const token = localStorage.getItem('token')
      
      // 팔로잉 목록 로드
      const followingResponse = await fetch(`http://localhost:3000/api/follow/following/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (followingResponse.ok) {
        const followingData = await followingResponse.json()
        if (followingData.success) {
          const followingIds = followingData.data.following?.map((f: any) => f.following_id) || []
          setFollowingList(followingIds)
          console.log('✅ 팔로잉 목록 로드 성공:', followingIds)
        }
      }
      
      // 팔로워 목록 로드
      const followersResponse = await fetch(`http://localhost:3000/api/follow/followers/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (followersResponse.ok) {
        const followersData = await followersResponse.json()
        if (followersData.success) {
          const followerIds = followersData.data.followers?.map((f: any) => f.follower_id) || []
          setFollowersList(followerIds)
          console.log('✅ 팔로워 목록 로드 성공:', followerIds)
        }
      }
    } catch (error) {
      console.error('팔로잉 데이터 로드 실패:', error)
    } finally {
      setIsFollowingLoading(false)
    }
  }

  // 팔로우/언팔로우 토글
  const toggleFollow = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('token')
      const isCurrentlyFollowing = followingList.includes(targetUserId)
      
      const url = isCurrentlyFollowing 
        ? `http://localhost:3000/api/follow/${targetUserId}`
        : 'http://localhost:3000/api/follow';
      
      const response = await fetch(url, {
        method: isCurrentlyFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: isCurrentlyFollowing ? undefined : JSON.stringify({ followingId: targetUserId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          if (isCurrentlyFollowing) {
            // 언팔로우
            setFollowingList(prev => prev.filter(id => id !== targetUserId))
            console.log('✅ 언팔로우 성공:', targetUserId)
          } else {
            // 팔로우
            setFollowingList(prev => [...prev, targetUserId])
            console.log('✅ 팔로우 성공:', targetUserId)
          }
          
          // 홈피드 새로고침 (팔로잉 상태 변경으로 인한 업데이트)
          if (activeMenu === 'home') {
            await loadDefaultHomeFeed()
          }
        }
      }
    } catch (error) {
      console.error('팔로우/언팔로우 실패:', error)
    }
  }

  // 메뉴 변경 핸들러
  const handleMenuChange = (menu: 'home' | 'following' | 'community' | 'myposts') => {
    setActiveMenu(menu)
    
    switch (menu) {
      case 'home':
        loadHomeFeed()
        break
      case 'following':
        loadFollowingData()
        break
      case 'community':
        // 커뮤니티에서는 모든 게시글 표시
        console.log('커뮤니티 페이지로 이동')
        fetchPosts()
        break
      case 'myposts':
        loadMyPosts()
        break
    }
  }

  // 사용자 검색 함수
  const handleUserSearch = async () => {
    if (!userSearchQuery.trim()) {
      setUserSearchResults([])
      setIsUserSearching(false)
      return
    }

    setIsUserSearching(true)
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 사용자 검색 시작:', userSearchQuery)
      
      const response = await fetch(`http://localhost:3000/api/auth/search?q=${encodeURIComponent(userSearchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 사용자 검색 응답:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📊 사용자 검색 결과:', data)
        
        if (data.success) {
          // 현재 사용자 제외하고 검색 결과 필터링
          const filteredUsers = data.data.users.filter((user: any) => user.id !== currentUser?.id)
          console.log('✅ 필터링된 사용자:', filteredUsers)
          setUserSearchResults(filteredUsers)
        } else {
          console.error('❌ 사용자 검색 API 실패:', data.error)
          setUserSearchResults([])
        }
      } else {
        console.error('❌ 사용자 검색 HTTP 오류:', response.status)
        setUserSearchResults([])
      }
    } catch (error) {
      console.error('💥 사용자 검색 실패:', error)
      setUserSearchResults([])
    } finally {
      setIsUserSearching(false)
    }
  }

  // 사용자 검색 결과 초기화
  const clearUserSearch = () => {
    setUserSearchQuery('')
    setUserSearchResults([])
    setIsUserSearching(false)
    setShowUserSearch(false)
  }

  // 사용자 프로필 방문
  const visitUserProfile = (userId: string, nickname: string) => {
    // 프로필 페이지로 이동
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="app-shell">
      {/* 상단 바 */}
      <header className="topbar">
        <Link to="/" className="top-brand">TEMPUS</Link>

        <div className="search">
          <input 
            placeholder="궁금한 것을 검색해보세요…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '검색중...' : '검색'}
          </button>
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search">
              ✕
            </button>
          )}
        </div>

        <div className="top-actions">
          <NotificationBell userId={currentUser?.id} />
          <button 
            className="chip" 
            onClick={() => navigate('/profile')}
          >
            👤 내 프로필
          </button>
          <button 
            className="chip logout" 
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              navigate('/')
            }}
          >
            🚪 로그아웃
          </button>
        </div>
      </header>

      {/* 메인 3열 */}
      <div className="app-grid">
        {/* ===== 좌측 사이드바 ===== */}
        <aside className="sidebar">
          <nav className="menu wide">
            <button 
              className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`}
              onClick={() => handleMenuChange('home')}
            >
              🏠 홈 피드
            </button>
            <button 
              className={`menu-item ${activeMenu === 'following' ? 'active' : ''}`}
              onClick={() => handleMenuChange('following')}
            >
              👥 팔로잉
            </button>
            <button 
              className={`menu-item ${activeMenu === 'community' ? 'active' : ''}`}
              onClick={() => handleMenuChange('community')}
            >
              💬 커뮤니티
            </button>
            <button 
              className={`menu-item ${activeMenu === 'myposts' ? 'active' : ''}`}
              onClick={() => handleMenuChange('myposts')}
            >
              📝 내 게시글
            </button>
          </nav>

          {/* 홈피드일 때만 내 정보 표시 */}
          {activeMenu === 'home' && (
            <section className="card user-info">
              <h4>👤 내 정보</h4>
              <div className="user-profile">
                <div className="avatar big">나</div>
                <div className="user-details">
                  <h5>{currentUser?.nickname || '사용자'}</h5>
                  <p className="temperature">🔥 {currentUser?.temperature || 36.5}℃</p>
                  <p className="email">{currentUser?.email || '이메일 정보 없음'}</p>
                </div>
              </div>
            </section>
          )}

          {/* 커뮤니티일 때만 카테고리와 정렬 옵션 표시 */}
          {activeMenu === 'community' && (
            <>
              {/* 카테고리 필터링 */}
              <section className="card category-filter">
                <h4>📂 카테고리</h4>
                <div className="category-list">
                  <button 
                    className={`category-item ${selectedCommunityCategory === '전체' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCommunityCategory('전체')
                      filterByCategory('전체')
                    }}
                  >
                    전체
                  </button>
                  {CATEGORIES.map(category => (
                    <button 
                      key={category}
                      className={`category-item ${selectedCommunityCategory === category ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCommunityCategory(category)
                        filterByCategory(category)
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>

              {/* 정렬 옵션 */}
              <section className="card sort-options">
                <h4>🔄 정렬</h4>
                <div className="sort-list">
                  <button 
                    className={`sort-item ${sortBy === 'latest' ? 'active' : ''}`}
                    onClick={() => sortPosts('latest')}
                  >
                    📅 최신순
                  </button>
                  <button 
                    className={`sort-item ${sortBy === 'popular' ? 'active' : ''}`}
                    onClick={() => sortPosts('popular')}
                  >
                    ❤️ 인기순
                  </button>
                  <button 
                    className={`sort-item ${sortBy === 'temperature' ? 'active' : ''}`}
                    onClick={() => sortPosts('temperature')}
                  >
                    🔥 온도순
                  </button>
                </div>
              </section>
            </>
          )}

          {/* 게시글 작성 폼 (홈피드와 커뮤니티에서 표시) */}
          {(activeMenu === 'home' || activeMenu === 'community') && (
            <section className="card composer-mini full">
              <h4>무슨 생각을 하고 계신가요?</h4>

              <input
                className="mini-input"
                placeholder="제목을 입력하세요..."
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />

              <textarea
                className="mini-input"
                rows={3}
                placeholder="오늘 있었던 일을 간단히 적어보세요…"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />

              <div className="mini-row">
                <select
                  className="mini-select"
                  value={draftCat}
                  onChange={(e) => setDraftCat(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="mini-actions">
                  <button className="pill">📷 사진</button>
                  <button className="pill">📍 위치</button>
                  <button className="pill">🏷 태그</button>
                </div>
              </div>

              <button
                className="btn primary full"
                disabled={!draftText.trim() || !draftTitle.trim()}
                onClick={handlePost}
                title={!draftText.trim() || !draftTitle.trim() ? '제목과 내용을 입력하세요' : '게시하기'}
              >
                게시하기
              </button>
            </section>
          )}
        </aside>

        {/* ===== 중앙 피드 ===== */}
        <main className="feed">
          {/* 팔로잉 메뉴일 때 팔로잉/팔로워 목록 표시 */}
          {activeMenu === 'following' && (
            <div className="following-section">
              <h2>👥 팔로잉 관리</h2>
              
              {/* 사용자 검색 섹션 */}
              <div className="user-search-section">
                <h3>🔍 사용자 검색</h3>
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="닉네임으로 사용자 검색..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                  />
                  <button onClick={handleUserSearch} disabled={isUserSearching}>
                    {isUserSearching ? '검색중...' : '검색'}
                  </button>
                  {userSearchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={clearUserSearch}
                      title="검색 초기화"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* 검색 결과 */}
                {userSearchResults.length > 0 && (
                  <div className="search-results">
                    <h4>검색 결과 ({userSearchResults.length}명)</h4>
                    {userSearchResults.map((user: any) => (
                      <div key={user.id} className="user-item">
                        <div className="user-avatar">{user.nickname?.charAt(0) || '?'}</div>
                        <div className="user-info">
                          <h4>{user.nickname || '알 수 없음'}</h4>
                          <p>🔥 {user.temperature || 36.5}℃</p>
                        </div>
                        <div className="user-actions">
                          <button 
                            className="btn primary small"
                            onClick={() => visitUserProfile(user.id, user.nickname)}
                          >
                            프로필
                          </button>
                          <button 
                            className={`btn ${followingList.includes(user.id) ? 'ghost' : 'primary'} small`}
                            onClick={() => toggleFollow(user.id)}
                          >
                            {followingList.includes(user.id) ? '언팔로우' : '팔로우'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 검색 결과가 없을 때 */}
                {userSearchQuery && userSearchResults.length === 0 && !isUserSearching && (
                  <div className="search-no-results">
                    <p>"{userSearchQuery}"에 해당하는 사용자를 찾을 수 없습니다.</p>
                    <p>다른 키워드로 검색해보세요.</p>
                  </div>
                )}
              </div>
              
              <div className="following-tabs">
                <button className="tab active">팔로잉 ({followingList.length})</button>
                <button className="tab">팔로워 ({followersList.length})</button>
              </div>
              <div className="following-list">
                {isFollowingLoading ? (
                  <div className="loading">로딩중...</div>
                ) : followingList.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>아직 팔로우한 사용자가 없습니다</h3>
                    <p>커뮤니티에서 관심 있는 사용자를 팔로우해보세요!</p>
                  </div>
                ) : (
                  <div className="user-list">
                    {followingList.map((userId: string) => (
                      <div key={userId} className="user-item">
                        <div className="user-avatar">{userId.charAt(0)}</div>
                        <div className="user-info">
                          <h4>사용자 {userId}</h4>
                          <p>팔로잉 중</p>
                        </div>
                        <button 
                          className="btn ghost small"
                          onClick={() => toggleFollow(userId)}
                        >
                          언팔로우
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 홈피드일 때만 게시글 표시 */}
          {activeMenu === 'home' && (
            <>
              {/* 홈피드 설명 */}
              <div className="home-feed-description card">
                <h3>🏠 홈 피드</h3>
                <p>팔로우한 사람들과 인기 게시글을 확인하세요!</p>
                <div className="feed-info">
                  <span className="info-item">👥 팔로워 게시글</span>
                  <span className="info-item">🔥 인기 게시글</span>
                  <span className="info-item">💡 추천 콘텐츠</span>
                </div>
              </div>

              {/* 검색 결과 또는 일반 게시글 */}
              {searchQuery ? (
                // 검색 결과 표시
                <div className="search-results">
                  <div className="search-header">
                    <h3>🔍 "{searchQuery}" 검색 결과</h3>
                    <button onClick={clearSearch} className="btn ghost">전체 게시글 보기</button>
                  </div>
                  
                  {isSearching ? (
                    <div className="loading">검색중...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(p => (
                      <article className="card post" key={p.id}>
                        <div className="post-head">
                          <div className="avatar">{p.user?.nickname?.charAt(0) || '?'}</div>
                          <div className="meta">
                            <div className="name">
                              <button 
                                className="user-nickname-btn"
                                onClick={() => visitUserProfile(p.user_id, p.user?.nickname || '알 수 없음')}
                              >
                                {p.user?.nickname || '알 수 없음'}
                              </button>
                              <span className="dot">·</span> 
                              <span className="time">
                                {formatTimeAgo(p.created_at)}
                              </span>
                            </div>
                            <div className="submeta">
                              <span className="chip tag">검색결과</span>
                              <span className="chip temp">🔥 {p.user?.temperature || 36.5}℃</span>
                              <span className="chip delta">
                                📈 {p.temperature_change > 0 ? `+${p.temperature_change}℃` : `${p.temperature_change}℃`}
                              </span>
                              {/* 팔로우/언팔로우 버튼 (내 게시글이 아닌 경우만) */}
                              {currentUser?.id !== p.user_id && (
                                <button 
                                  className={`chip follow-btn ${p.isFollowing ? 'following' : ''}`}
                                  onClick={() => toggleFollow(p.user_id)}
                                >
                                  {p.isFollowing ? '👥 팔로잉' : '➕ 팔로우'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="post-title">{p.title}</h3>
                          <p className="text">{p.content}</p>
                        </div>
                        <div className="post-actions">
                          <button 
                            className={`chip like-btn ${p.isLiked ? 'liked' : ''}`}
                            onClick={() => toggleLike(p.id)}
                          >
                            {p.isLiked ? '❤️' : '🤍'} 
                            <span className="like-count">{p.likes || 0}</span>
                          </button>
                          <button className="chip">💬 {p.comments?.length || 0}</button>
                          <button className="chip">↗ 공유</button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <h3>검색 결과가 없습니다</h3>
                      <p>다른 키워드로 검색해보세요</p>
                    </div>
                  )}
                </div>
              ) : (
                // 일반 게시글 표시
                <>
                  {filteredPosts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <h3>아직 게시글이 없습니다</h3>
                      <p>첫 번째 게시글을 작성해보세요!</p>
                    </div>
                  ) : (
                    filteredPosts.map(p => (
                      <article className="card post" key={p.id}>
                        <div className="post-head">
                          <div className="avatar">{p.user?.nickname?.charAt(0) || '?'}</div>
                          <div className="meta">
                            <div className="name">
                              <button 
                                className="user-nickname-btn"
                                onClick={() => visitUserProfile(p.user_id, p.user?.nickname || '알 수 없음')}
                              >
                                {p.user?.nickname || '알 수 없음'}
                              </button>
                              <span className="dot">·</span> 
                              <span className="time">
                                {formatTimeAgo(p.created_at)}
                              </span>
                            </div>
                            <div className="submeta">
                              <span className="chip tag">{p.category || '자유'}</span>
                              <span className="chip temp">🔥 {p.user?.temperature || 36.5}℃</span>
                              <span className="chip delta">
                                📈 {p.temperature_change > 0 ? `+${p.temperature_change}℃` : `${p.temperature_change}℃`}
                              </span>
                              {/* 팔로워 게시글인지 인기 게시글인지 표시 */}
                              <span className="chip follow-status">
                                {p.isFollowing ? '👥 팔로워' : (p.isPopular ? '🔥 인기' : '💫 추천')}
                              </span>
                              {/* 팔로우/언팔로우 버튼 (내 게시글이 아닌 경우만) */}
                              {currentUser?.id !== p.user_id && (
                                <button 
                                  className={`chip follow-btn ${p.isFollowing ? 'following' : ''}`}
                                  onClick={() => toggleFollow(p.user_id)}
                                >
                                  {p.isFollowing ? '👥 팔로잉' : '➕ 팔로우'}
                                </button>
                              )}
                            </div>
                            {/* 내 게시글인 경우 수정/삭제 버튼 */}
                            {currentUser?.id === p.user_id && (
                              <div className="post-actions-menu">
                                <button 
                                  className="btn-edit" 
                                  onClick={() => startEdit(p)}
                                  disabled={isLoading}
                                >
                                  ✏️ 수정
                                </button>
                                <button 
                                  className="btn-delete" 
                                  onClick={() => handleDeletePost(p.id)}
                                  disabled={isLoading}
                                >
                                  🗑️ 삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 수정 모드일 때 */}
                        {editingPostId === p.id ? (
                          <div className="edit-mode">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="edit-input"
                              placeholder="제목을 입력하세요..."
                            />
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="edit-textarea"
                              rows={3}
                            />
                            <div className="edit-actions">
                              <button 
                                className="btn primary" 
                                onClick={() => handleEditPost(p.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? '수정중...' : '수정 완료'}
                              </button>
                              <button 
                                className="btn ghost" 
                                onClick={cancelEdit}
                                disabled={isLoading}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="post-title">{p.title}</h3>
                            <p className="text">{p.content}</p>
                            {/* 해시태그 표시 */}
                            {extractHashtags(p.content).length > 0 && (
                              <div className="hashtags">
                                {extractHashtags(p.content).map((tag, index) => (
                                  <button
                                    key={index}
                                    className="hashtag"
                                    onClick={() => handleHashtagClick(tag)}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="post-actions">
                          <button 
                            className={`chip like-btn ${p.isLiked ? 'liked' : ''}`}
                            onClick={() => toggleLike(p.id)}
                          >
                            {p.isLiked ? '❤️' : '🤍'} 
                            <span className="like-count">{p.likes || 0}</span>
                          </button>
                          <button 
                            className="chip comment-btn"
                            onClick={() => setReplyingTo(replyingTo === p.id ? null : p.id)}
                          >
                            💬 {p.comments?.length || 0}
                          </button>
                          <button className="chip">↗ 공유</button>
                        </div>

                        {/* 댓글 입력 폼 */}
                        {replyingTo === p.id && (
                          <div className="comment-form">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="댓글을 입력하세요..."
                              rows={2}
                            />
                            <div className="comment-actions">
                              <button 
                                className="btn primary"
                                onClick={() => handleComment(p.id)}
                              >
                                댓글 작성
                              </button>
                              <button 
                                className="btn ghost"
                                onClick={() => {
                                  setCommentText('')
                                  setReplyingTo(null)
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 댓글 표시 */}
                        {renderComments(p)}
                      </article>
                    ))
                  )}
                </>
              )}
            </>
          )}

          {/* 커뮤니티 메뉴일 때 커뮤니티 게시글 표시 */}
          {activeMenu === 'community' && (
            <div className="community-section">
              <h2>💬 커뮤니티</h2>
              <p className="community-description">
                {selectedCommunityCategory === '전체' 
                  ? '모든 사용자들의 게시글을 확인하세요' 
                  : `${selectedCommunityCategory} 카테고리의 게시글을 확인하세요`
                }
              </p>
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>아직 커뮤니티 게시글이 없습니다</h3>
                  <p>첫 번째 커뮤니티 게시글을 작성해보세요!</p>
                </div>
              ) : (
                filteredPosts.map(p => (
                  <article className="card post" key={p.id}>
                    <div className="post-head">
                      <div className="avatar">{p.user?.nickname?.charAt(0) || '?'}</div>
                      <div className="meta">
                        <div className="name">
                          <button 
                            className="user-nickname-btn"
                            onClick={() => visitUserProfile(p.user_id, p.user?.nickname || '알 수 없음')}
                          >
                            {p.user?.nickname || '알 수 없음'}
                          </button>
                          <span className="dot">·</span> 
                          <span className="time">
                            {formatTimeAgo(p.created_at)}
                          </span>
                        </div>
                        <div className="submeta">
                          <span className="chip tag">{p.category || '자유'}</span>
                          <span className="chip temp">🔥 {p.user?.temperature || 36.5}℃</span>
                          <span className="chip delta">
                            📈 {p.temperature_change > 0 ? `+${p.temperature_change}℃` : `${p.temperature_change}℃`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="post-title">{p.title}</h3>
                      <p className="text">{p.content}</p>
                    </div>
                    <div className="post-actions">
                      <button 
                        className={`chip like-btn ${p.isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(p.id)}
                      >
                        {p.isLiked ? '❤️' : '🤍'} 
                        <span className="like-count">{p.likes || 0}</span>
                      </button>
                      <button 
                        className="chip comment-btn"
                        onClick={() => setReplyingTo(replyingTo === p.id ? null : p.id)}
                      >
                        💬 {p.comments?.length || 0}
                      </button>
                      <button className="chip">↗ 공유</button>
                    </div>
                    {/* 댓글 입력 폼 */}
                    {replyingTo === p.id && (
                      <div className="comment-form">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="댓글을 입력하세요..."
                          rows={2}
                        />
                        <div className="comment-actions">
                          <button 
                            className="btn primary"
                            onClick={() => handleComment(p.id)}
                          >
                            댓글 작성
                          </button>
                          <button 
                            className="btn ghost"
                            onClick={() => {
                              setCommentText('')
                              setReplyingTo(null)
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                    {/* 댓글 표시 */}
                    {renderComments(p)}
                  </article>
                ))
              )}
            </div>
          )}

          {/* 내 게시글 메뉴일 때 내 게시글 표시 */}
          {activeMenu === 'myposts' && (
            <div className="my-posts-section">
              <h2>📝 내 게시글</h2>
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>아직 내 게시글이 없습니다</h3>
                  <p>첫 번째 게시글을 작성해보세요!</p>
                </div>
              ) : (
                filteredPosts.map(p => (
                  <article className="card post" key={p.id}>
                    <div className="post-head">
                      <div className="avatar">{p.user?.nickname?.charAt(0) || '?'}</div>
                      <div className="meta">
                        <div className="name">
                          <button 
                            className="user-nickname-btn"
                            onClick={() => visitUserProfile(p.user_id, p.user?.nickname || '알 수 없음')}
                          >
                            {p.user?.nickname || '알 수 없음'}
                          </button>
                          <span className="dot">·</span> 
                          <span className="time">
                            {formatTimeAgo(p.created_at)}
                          </span>
                        </div>
                        <div className="submeta">
                          <span className="chip tag">{p.category || '자유'}</span>
                          <span className="chip temp">🔥 {p.user?.temperature || 36.5}℃</span>
                          <span className="chip delta">
                            📈 {p.temperature_change > 0 ? `+${p.temperature_change}℃` : `${p.temperature_change}℃`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="post-title">{p.title}</h3>
                      <p className="text">{p.content}</p>
                    </div>
                    <div className="post-actions">
                      <button 
                        className={`chip like-btn ${p.isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(p.id)}
                      >
                        {p.isLiked ? '❤️' : '🤍'} 
                        <span className="like-count">{p.likes || 0}</span>
                      </button>
                      <button 
                        className="chip comment-btn"
                        onClick={() => setReplyingTo(replyingTo === p.id ? null : p.id)}
                      >
                        💬 {p.comments?.length || 0}
                      </button>
                      <button className="chip">↗ 공유</button>
                    </div>
                    {/* 댓글 입력 폼 */}
                    {replyingTo === p.id && (
                      <div className="comment-form">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="댓글을 입력하세요..."
                          rows={2}
                        />
                        <div className="comment-actions">
                          <button 
                            className="btn primary"
                            onClick={() => handleComment(p.id)}
                          >
                            댓글 작성
                          </button>
                          <button 
                            className="btn ghost"
                            onClick={() => {
                              setCommentText('')
                              setReplyingTo(null)
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                    {/* 댓글 표시 */}
                    {renderComments(p)}
                  </article>
                ))
              )}
            </div>
          )}
        </main>

        {/* ===== 우측(트렌드만) ===== */}
        <aside className="right">
          <section className="card widget">
            <div className="widget-head">
              <span>📈</span><h4>실시간 트렌드</h4>
            </div>
            <ol className="trend">
              {trendingHashtags.length > 0 ? (
                trendingHashtags.map((tag, index) => (
                  <li key={index}>
                    <button 
                      className="trending-hashtag"
                      onClick={() => handleHashtagClick(tag)}
                    >
                      {tag}
                    </button>
                  </li>
                ))
              ) : (
                <>
                  <li>#중간고사스터디</li>
                  <li>#학교맛집</li>
                  <li>#과제도움</li>
                  <li>#동아리모집</li>
                  <li>#교재나눔</li>
                </>
              )}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}