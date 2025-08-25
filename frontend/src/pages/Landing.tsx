// src/pages/Landing.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'   // ✅ 꼭 필요!

export default function Landing() {
  const navigate = useNavigate()
  const [appName] = useState('campdrop')
  const [showHow, setShowHow] = useState(false)
  
  // 인증 상태
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = showHow ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showHow])

  // 인증 함수들
  const handleAuth = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      if (isLoginMode) {
        // 로그인
        const response = await fetch('http://localhost:3000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 토큰과 사용자 ID 저장
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('userId', data.data.user.id)
          
          // 사용자 정보 저장 (닉네임, 이메일)
          localStorage.setItem('userNickname', data.data.user.nickname)
          localStorage.setItem('userEmail', data.data.user.email)
          
          console.log('✅ 로그인 성공! 사용자 정보 저장:', {
            nickname: data.data.user.nickname,
            email: data.data.user.email
          })
          
          navigate('/app')
        } else {
          setError(data.error || '로그인에 실패했습니다.')
        }
      } else {
        // 회원가입
        const response = await fetch('http://localhost:3000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 회원가입 성공 시 사용자 정보 저장
          localStorage.setItem('userNickname', data.data.user.nickname)
          localStorage.setItem('userEmail', data.data.user.email)
          
          console.log('✅ 회원가입 성공! 사용자 정보 저장:', {
            nickname: data.data.user.nickname,
            email: data.data.user.email
          })
          
          setError('회원가입이 완료되었습니다. 로그인해주세요.')
          setIsLoginMode(true)
          setEmail('')
          setPassword('')
          setNickname('')
        } else {
          setError(data.error || '회원가입에 실패했습니다.')
        }
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="landing">
      <header className="nav">
        <div className="brand">{appName}</div>
      </header>

      <main className="content">
        {/* 왼쪽 히어로 */}
        <section className="hero">
          <div className="logo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v5A3.5 3.5 0 0 1 16.5 14H11l-3.8 3.2c-.9.77-2.2.1-2.2-1V14A3.5 3.5 0 0 1 4 10.5v-5Z" fill="currentColor"/>
            </svg>
          </div>

          <h1 className="headline">소통하는 우리들의 대학 커뮤니티</h1>
          <p className="sub">{appName}</p>

          <div className="actions">
            <div className="auth-form">
              {error && <div className="error-message">{error}</div>}
              
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
              
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
              
              {!isLoginMode && (
                <input
                  type="text"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="auth-input"
                />
              )}
              
              <button 
                className="btn primary" 
                onClick={handleAuth}
                disabled={isLoading || !email || !password || (!isLoginMode && !nickname)}
              >
                {isLoading ? '처리중...' : (isLoginMode ? '로그인' : '회원가입')}
              </button>
              
              <button 
                className="btn ghost" 
                onClick={() => setIsLoginMode(!isLoginMode)}
              >
                {isLoginMode ? '회원가입' : '로그인'} 모드로 변경
              </button>
            </div>
          </div>
        </section>

        {/* 오른쪽 패널 2개 */}
        <aside className="sidepanels">
          {/* 🔹 How to use = 오버레이 열기 (a href 쓰지 말고 button으로!) */}
          <button
            type="button"
            className="panel panel--about as-button"
            onClick={() => setShowHow(true)}
          >
            <h2 className="multi-title">
              <span>How</span><span>to</span><span>use</span>
            </h2>
            <p></p>
          </button>

          {/* 🔹 Get started = /app 로 이동 (반드시 Link 사용) */}
          <Link className="panel panel--start" to="/app">
            <h2 className="multi-title">
              <span>Get</span><span>Started</span><span>with</span><span>campdrop!</span>
            </h2>
            <p></p>
          </Link>
        </aside>
      </main>

      {/* 오버레이 */}
      <div className={`how-overlay ${showHow ? 'open' : ''}`}>
        <div className="how-sheet">
          <div className="how-top">
            <div className="how-title">How to use</div>
            <button className="icon-close" onClick={() => setShowHow(false)}>✕</button>
          </div>

          <div className="how-grid">
            <div className="how-card"><div className="how-num">01</div><h3>가입 & 학교 인증</h3><p>학교 이메일로 인증</p></div>
            <div className="how-card"><div className="how-num">02</div><h3>관심 커뮤니티 팔로우</h3><p>학과/동아리 구독</p></div>
            <div className="how-card"><div className="how-num">03</div><h3>피드에서 소통</h3><p>글/사진/태그</p></div>
          </div>

          <div className="how-cta">
            <Link className="btn primary" to="/app">바로 시작하기</Link>
            <button className="btn ghost" onClick={() => setShowHow(false)}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
