import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // 에러는 스토어에서 처리됨
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-purple-50">
      <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-lg p-8 w-96 flex flex-col gap-6">
        <div className="text-2xl font-bold text-orange-500 text-center mb-2">TEMPUS 로그인</div>
        
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        
        <button 
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2 rounded transition-colors"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        
        <div className="text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <a href="/register" className="text-orange-500 font-bold hover:underline">
            회원가입
          </a>
        </div>
      </form>
    </div>
  );
}