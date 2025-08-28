import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing.tsx'
import MainApp from './pages/MainApp.tsx'
import Profile from './pages/Profile.tsx'
import UserProfile from './pages/UserProfile.tsx'
import { createApiUrl } from './config/api'

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      // 기본 검증
      if (!token || !userId || token === 'undefined' || userId === 'undefined') {
        console.log('🚫 인증 실패: 토큰 또는 사용자 ID가 없음')
        localStorage.clear()
        setIsValidating(false)
        return
      }
      
      // 토큰 형식 검증
      if (typeof token === 'string' && !token.includes('.')) {
        console.log('🚫 인증 실패: 잘못된 토큰 형식')
        localStorage.clear()
        setIsValidating(false)
        return
      }
      
      try {
        // 실제 API 호출로 토큰 유효성 검증
        const response = await fetch(createApiUrl(`/api/users/${userId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          console.log('✅ 인증 성공: 유효한 토큰')
          setIsAuthenticated(true)
        } else {
          console.log('🚫 인증 실패: 토큰이 유효하지 않음')
          localStorage.clear()
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.log('🚫 인증 실패: 네트워크 오류')
        localStorage.clear()
        setIsAuthenticated(false)
      } finally {
        setIsValidating(false)
      }
    }
    
    validateToken()
  }, [])
  
  if (isValidating) {
    return <div>인증 확인 중...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
