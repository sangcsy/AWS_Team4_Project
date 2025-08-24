import { useState } from 'react'
import { Link } from 'react-router-dom'

type Post = {
  id: number
  user: string
  minutes: number
  badge: string
  temp: string
  tag: string
  delta: string
  text: string
  likes?: number
  comments?: number
}

const CATEGORIES = ['자유', '커뮤니티', '재능마켓', '트렌딩', '스터디', '학교맛집']

export default function MainApp() {
  // 피드 데이터 상태
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 2,
      user: '공부맨',
      minutes: 15,
      badge: '공',
      temp: '72.1℃',
      tag: '스터디',
      delta: '+1.1℃',
      text: '중간고사 스터디 그룹 모집합니다! 회계원론 같이 공부하실 분 환영!',
      likes: 24,
      comments: 8,
    },
    {
      id: 1,
      user: '따뜻한친구',
      minutes: 2,
      badge: '따',
      temp: '85.2℃',
      tag: '나눔',
      delta: '+2.3℃',
      text: '도서관에서 전공서적 무료나눔 했어요! 후배들이 정말 고마워해서 뿌듯했습니다 😊',
      likes: 24,
      comments: 8,
    },
  ])

  // 사이드바 작성 상태
  const [draftText, setDraftText] = useState('')
  const [draftCat, setDraftCat] = useState(CATEGORIES[0])

  const handlePost = () => {
    const text = draftText.trim()
    if (!text) return
    const newPost: Post = {
      id: Date.now(),
      user: '나',
      minutes: 0,
      badge: '나',
      temp: '—',
      tag: draftCat,
      delta: '+0.0℃',
      text,
      likes: 0,
      comments: 0,
    }
    // 새 글을 맨 위에
    setPosts(prev => [newPost, ...prev])
    setDraftText('')
  }

  return (
    <div className="app-shell">
      {/* 상단 바 */}
      <header className="topbar">
        <Link to="/" className="top-brand">campdrop</Link>

        <div className="search">
          <input placeholder="궁금한 것을 검색해보세요…" />
          <button>검색</button>
        </div>

        <div className="top-actions">
          <button className="chip">🔔 알림</button>
          <button className="chip">👤 내 프로필</button>
        </div>
      </header>

      {/* 메인 3열 */}
      <div className="app-grid">
        {/* ===== 좌측 사이드바 ===== */}
        <aside className="sidebar">
          <nav className="menu wide">
            <a className="menu-item active">🏠 홈 피드</a>
            <a className="menu-item">👥 팔로잉</a>
            <a className="menu-item">📈 트렌딩</a>
            <a className="menu-item">🛍 재능마켓</a>
            <a className="menu-item">💬 커뮤니티</a>
            <Link to="/random-chat" className="menu-item">🎲 랜덤 채팅</Link>
          </nav>

          {/* 작성 박스 (입력 + 카테고리 + 버튼) */}
          <section className="card composer-mini full">
            <h4>무슨 생각을 하고 계신가요?</h4>

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
              disabled={!draftText.trim()}
              onClick={handlePost}
              title={!draftText.trim() ? '내용을 입력하세요' : '게시하기'}
            >
              게시하기
            </button>
          </section>
        </aside>

        {/* ===== 중앙 피드 ===== */}
        <main className="feed">
          {/* 상단 간단 컴포저는 유지(선택 사항) */}
          <div className="composer card">
            <div className="avatar big">나</div>
            <input
              placeholder="오늘 어떤 따뜻한 일이 있었나요? 함께 나눠보세요…"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
            <button className="btn primary" disabled={!draftText.trim()} onClick={handlePost}>게시하기</button>
          </div>

          {posts.map(p => (
            <article className="card post" key={p.id}>
              <div className="post-head">
                <div className="avatar">{p.badge}</div>
                <div className="meta">
                  <div className="name">{p.user} <span className="dot">·</span> <span className="time">{p.minutes}분 전</span></div>
                  <div className="submeta">
                    <span className="chip tag">{p.tag}</span>
                    <span className="chip temp">🔥 {p.temp}</span>
                    <span className="chip delta">📈 {p.delta}</span>
                  </div>
                </div>
              </div>

              <p className="text">{p.text}</p>

              <div className="post-actions">
                <button className="chip">❤️ {p.likes ?? 0}</button>
                <button className="chip">💬 {p.comments ?? 0}</button>
                <button className="chip">↗ 공유</button>
              </div>
            </article>
          ))}
        </main>

        {/* ===== 우측(트렌드만) ===== */}
        <aside className="right">
          <section className="card widget">
            <div className="widget-head">
              <span>📈</span><h4>실시간 트렌드</h4>
            </div>
            <ol className="trend">
              <li>#중간고사스터디</li>
              <li>#학교맛집</li>
              <li>#과제도움</li>
              <li>#동아리모집</li>
              <li>#교재나눔</li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
