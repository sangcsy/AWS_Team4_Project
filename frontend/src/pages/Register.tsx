import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const { register, checkNickname, isLoading, error } = useUserStore();
  const navigate = useNavigate();

  const handleNicknameCheck = async () => {
    if (!nickname.trim()) return;
    
    try {
      const available = await checkNickname(nickname);
      setNicknameAvailable(available);
    } catch (error) {
      setNicknameAvailable(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !nickname.trim() || !password.trim()) return;
    if (password !== confirmPassword) return;
    if (nicknameAvailable === false) return;
    
    try {
      await register(email, password, nickname);
      navigate('/');
    } catch (error) {
      // 에러는 스토어에서 처리됨
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-purple-50">
      <form onSubmit={handleRegister} className="bg-white rounded-xl shadow-lg p-8 w-96 flex flex-col gap-6">
        <div className="text-2xl font-bold text-orange-500 text-center mb-2">TEMPUS 회원가입</div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">이메일</label>
          <input 
            className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">닉네임</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
              type="text" 
              value={nickname} 
              onChange={e => {
                setNickname(e.target.value);
                setNicknameAvailable(null);
              }}
              placeholder="닉네임을 입력하세요"
              required
            />
            <button 
              type="button"
              onClick={handleNicknameCheck}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              확인
            </button>
          </div>
          {nicknameAvailable !== null && (
            <div className={`text-sm ${nicknameAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {nicknameAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">비밀번호</label>
          <input 
            className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">비밀번호 확인</label>
          <input 
            className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <div className="text-sm text-red-600">비밀번호가 일치하지 않습니다.</div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <button 
          type="submit"
          disabled={
            isLoading || 
            !email.trim() || 
            !nickname.trim() || 
            !password.trim() || 
            password !== confirmPassword ||
            nicknameAvailable === false
          }
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2 rounded transition-colors"
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </button>
        
        <div className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-orange-500 font-bold hover:underline">
            로그인
          </a>
        </div>
      </form>
    </div>
  );
}