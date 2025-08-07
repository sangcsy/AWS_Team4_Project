import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useMyRoomStore } from '../store/myRoomStore';
import { useUserStore } from '../store/userStore';

export default function MyRoom() {
  const { nickname } = useParams<{ nickname: string }>();
  const { profile, isLoading, error, getMyRoom, followUser, unfollowUser } = useMyRoomStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (nickname) {
      getMyRoom(nickname);
    }
  }, [nickname, getMyRoom]);

  const handleFollow = async () => {
    if (nickname) {
      if (profile?.isFollowing) {
        await unfollowUser(nickname);
      } else {
        await followUser(nickname);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl text-orange-500">마이룸을 불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl text-gray-500">사용자를 찾을 수 없습니다.</div>
        </main>
      </div>
    );
  }

  const isMyProfile = user?.nickname === nickname;

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl flex flex-col gap-6 items-center">
          <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center text-3xl font-bold text-white mb-2">
            {profile.nickname.charAt(0)}
          </div>
          <div className="text-2xl font-bold">{profile.nickname}</div>
          <div className="text-orange-500 font-bold text-lg">온도 {profile.temperature}℃</div>
          
          {profile.description && (
            <div className="text-gray-600 text-center max-w-md">{profile.description}</div>
          )}
          
          <div className="flex gap-6 text-center">
            <div>
              <div className="font-bold text-lg">{profile.followers}</div>
              <div className="text-sm text-gray-500">팔로워</div>
            </div>
            <div>
              <div className="font-bold text-lg">{profile.followings}</div>
              <div className="text-sm text-gray-500">팔로잉</div>
            </div>
          </div>

          {!isMyProfile && (
            <div className="flex gap-4 mt-2">
              <button 
                onClick={handleFollow}
                className={`px-4 py-2 rounded-full font-bold ${
                  profile.isFollowing 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {profile.isFollowing ? '언팔로우' : '팔로우'}
              </button>
              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold">
                메시지
              </button>
            </div>
          )}

          <div className="w-full mt-4">
            <div className="font-bold mb-2">수집 아이템</div>
            <div className="grid grid-cols-3 gap-2">
              {profile.items.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs font-bold">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.type}</div>
                </div>
              ))}
            </div>
            {profile.items.length === 0 && (
              <div className="bg-gray-50 rounded p-4 text-sm text-center text-gray-500">
                아직 수집한 아이템이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}