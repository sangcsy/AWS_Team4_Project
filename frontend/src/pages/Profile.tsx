import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Profile {
  id: string
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  major: string
  mbti: string
  hobbies: string
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  
  // 폼 상태
  const [formData, setFormData] = useState({
    height: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    major: '',
    mbti: '',
    hobbies: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
    fetchProfile()
  }, [navigate])

  // 프로필 조회
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const response = await fetch(`http://localhost:3000/api/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        // 폼 데이터 설정
        setFormData({
          height: data.data.height?.toString() || '',
          age: data.data.age?.toString() || '',
          gender: data.data.gender || 'male',
          major: data.data.major || '',
          mbti: data.data.mbti || '',
          hobbies: data.data.hobbies || ''
        })
      } else if (data.error === 'Profile not found') {
        // 프로필이 없는 경우
        setProfile(null)
      }
    } catch (error) {
      console.error('프로필 조회 실패:', error)
      setError('프로필을 불러오는데 실패했습니다.')
    }
  }

  // 프로필 생성/수정
  const handleSubmit = async () => {
    if (!formData.height || !formData.age || !formData.major) {
      setError('필수 항목을 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const method = profile ? 'PUT' : 'POST'
      const url = profile 
        ? `http://localhost:3000/api/profiles/${userId}`
        : 'http://localhost:3000/api/profiles'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          height: parseInt(formData.height),
          age: parseInt(formData.age),
          gender: formData.gender,
          major: formData.major,
          mbti: formData.mbti,
          hobbies: formData.hobbies
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (profile) {
          // 수정 성공
          setProfile(data.data)
          setIsEditing(false)
        } else {
          // 생성 성공
          setProfile(data.data)
        }
        setError('프로필이 저장되었습니다.')
      } else {
        setError(data.error || '프로필 저장에 실패했습니다.')
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 수정 모드 시작
  const startEdit = () => {
    setIsEditing(true)
  }

  // 수정 모드 취소
  const cancelEdit = () => {
    setIsEditing(false)
    // 원래 데이터로 복원
    if (profile) {
      setFormData({
        height: profile.height?.toString() || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || 'male',
        major: profile.major || '',
        mbti: profile.mbti || '',
        hobbies: profile.hobbies || ''
      })
    }
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="btn-back" onClick={() => navigate('/app')}>
          ← 뒤로 가기
        </button>
        <h1>내 프로필</h1>
      </header>

      <main className="profile-content">
        {error && <div className="error-message">{error}</div>}

        {!profile && !isEditing ? (
          // 프로필이 없는 경우
          <div className="profile-empty">
            <p>아직 프로필이 없습니다.</p>
            <button 
              className="btn primary" 
              onClick={() => setIsEditing(true)}
            >
              프로필 만들기
            </button>
          </div>
        ) : (
          // 프로필 표시/편집
          <div className="profile-form">
            <div className="form-group">
              <label>키 (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                disabled={!isEditing}
                placeholder="170"
              />
            </div>

            <div className="form-group">
              <label>나이</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                disabled={!isEditing}
                placeholder="20"
              />
            </div>

            <div className="form-group">
              <label>성별</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                disabled={!isEditing}
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="form-group">
              <label>전공</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
                disabled={!isEditing}
                placeholder="컴퓨터공학과"
              />
            </div>

            <div className="form-group">
              <label>MBTI</label>
              <input
                type="text"
                value={formData.mbti}
                onChange={(e) => setFormData({...formData, mbti: e.target.value})}
                disabled={!isEditing}
                placeholder="INTJ"
              />
            </div>

            <div className="form-group">
              <label>취미</label>
              <textarea
                value={formData.hobbies}
                onChange={(e) => setFormData({...formData, hobbies: e.target.value})}
                disabled={!isEditing}
                placeholder="독서, 영화감상, 게임..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button 
                    className="btn primary" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? '저장중...' : '저장'}
                  </button>
                  <button 
                    className="btn ghost" 
                    onClick={cancelEdit}
                    disabled={isLoading}
                  >
                    취소
                  </button>
                </>
              ) : (
                <button 
                  className="btn primary" 
                  onClick={startEdit}
                >
                  프로필 수정
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
