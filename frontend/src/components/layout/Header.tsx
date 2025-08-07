import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

export default function Header() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (user?.nickname) {
      navigate(`/myroom/${user.nickname}`);
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-8 bg-white/80 shadow-sm">
      <div 
        className="font-bold text-xl text-orange-500 cursor-pointer"
        onClick={() => navigate('/')}
      >
        TEMPUS
      </div>
      
      <input 
        className="w-96 px-4 py-2 rounded-full border bg-gray-50" 
        placeholder="궁금한 것을 검색해보세요..." 
      />
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-orange-600 font-semibold">
              내 온도 <b>{user.temperature}℃</b>
            </span>
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center font-bold text-white cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user.nickname.charAt(0)}
              </div>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={handleProfileClick}
                  >
                    마이룸
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => navigate('/market')}
                  >
                    마켓
                  </button>
                  <hr className="my-1" />
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <button 
              className="text-orange-500 font-bold hover:underline"
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm"
              onClick={() => navigate('/register')}
            >
              회원가입
            </button>
          </div>
        )}
      </div>
    </header>
  );
}