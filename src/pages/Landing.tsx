// src/pages/Landing.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'   // ✅ 꼭 필요!

export default function Landing() {
  const [appName] = useState('campdrop')
  const [showHow, setShowHow] = useState(false)

  useEffect(() => {
    document.body.style.overflow = showHow ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showHow])

  return (
<style>{`
        /* 랜딩페이지 기본 스타일 */
        .landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .nav {
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        
        .content {
          flex: 1;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        
        .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          color: white;
          padding: 2rem;
        }
        
        .logo svg {
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .headline {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .sub {
          font-size: 1.5rem;
          opacity: 0.8;
          margin-bottom: 3rem;
        }
        
        .actions {
          display: flex;
          gap: 1rem;
        }
        
        .btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }
        
        .btn.primary {
          background: white;
          color: #667eea;
        }
        
        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .btn.ghost {
          background: transparent;
          color: white;
          border: 2px solid white;
        }
        
        .btn.ghost:hover {
          background: white;
          color: #667eea;
        }
        
        .sidepanels {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .panel {
          flex: 1;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.2);
          text-decoration: none;
          display: block;
          text-align: left;
          font: inherit;
        }
        
        .panel:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.2);
        }
        
        .multi-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        
        /* 오버레이 스타일 - 첨부하신 HTML 스타일 */
        :root {
          --bg1: #e0f7ff;
          --bg2: #a5d8ff;
          --bg3: #74c0fc;
          --bg4: #4dabf7;
          --text: #0f172a;
          --muted: #64748b;
          --brand: #1d4ed8;
          --card-bg: rgba(255,255,255,0.8);
          --card-border: rgba(255,255,255,0.3);
          --radius: 16px;
          --shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }
        
        .how-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(5px);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .how-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        
        .how-sheet {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          width: 90%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
          background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 50%, var(--bg3) 100%);
          border-radius: 20px;
          padding: 3rem 2rem;
          transition: all 0.3s ease;
        }
        
        .how-overlay.open .how-sheet {
          transform: translate(-50%, -50%) scale(1);
        }
        
        .how-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }
        
        .how-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .icon-close {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .icon-close:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .how-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .how-card {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border-radius: var(--radius);
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: var(--shadow);
          border: 1px solid var(--card-border);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        
        .how-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }
        
        .how-card:hover::before {
          left: 100%;
        }
        
        .how-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }
        
        .how-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--bg3), var(--bg4));
          color: white;
          font-size: 2rem;
          font-weight: 800;
          border-radius: 50%;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px rgba(29, 78, 216, 0.3);
          transition: all 0.3s ease;
        }
        
        .how-card:hover .how-num {
          transform: rotate(360deg) scale(1.1);
          box-shadow: 0 15px 35px rgba(29, 78, 216, 0.4);
        }
        
        .how-card:nth-child(2) .how-num {
          background: linear-gradient(135deg, var(--brand), var(--bg4));
        }
        
        .how-card:nth-child(3) .how-num {
          background: linear-gradient(135deg, var(--bg2), var(--bg3));
        }
        
        .how-card:nth-child(4) .how-num {
          background: linear-gradient(135deg, var(--brand), var(--bg2));
        }
        
        .how-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 1rem;
          transition: color 0.3s ease;
        }
        
        .how-card:hover h3 {
          color: var(--brand);
        }
        
        .how-card p {
          font-size: 1.1rem;
          color: var(--muted);
          line-height: 1.6;
          font-weight: 500;
        }
        
        .how-card:hover p {
          color: var(--text);
        }
        
        .how-cta {
          text-align: center;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        /* 애니메이션 */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .how-card:nth-child(1) {
          animation: float 3s ease-in-out infinite;
        }
        
        .how-card:nth-child(2) {
          animation: float 3s ease-in-out infinite 0.5s;
        }
        
        .how-card:nth-child(3) {
          animation: float 3s ease-in-out infinite 1s;
        }
        
        .how-card:nth-child(4) {
          animation: float 3s ease-in-out infinite 1.5s;
        }
        
        /* 반응형 */
        @media (max-width: 768px) {
          .content {
            grid-template-columns: 1fr;
          }
          
          .headline {
            font-size: 2rem;
          }
          
          .how-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .how-card {
            padding: 2rem 1.5rem;
          }
          
          .how-num {
            width: 70px;
            height: 70px;
            font-size: 1.8rem;
          }
          
          .how-cta {
            flex-direction: column;
            align-items: center;
          }
          
          .how-sheet {
            width: 95%;
            padding: 2rem 1rem;
          }
          
          .how-title {
            font-size: 2rem;
          }
        }
      `}</style>


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
            <button className="btn primary">로그인</button>
            <button className="btn ghost">회원가입</button>
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
            <div className="how-card"><div className="how-num">04</div><h3>랜덤 채팅</h3><p>익명으로 새로운 친구 만나기</p></div>
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
