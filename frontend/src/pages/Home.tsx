import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';

export default function Home() {
  const [newPostContent, setNewPostContent] = useState('');
  const { posts, isLoading, error, getFeed, createPost, likePost } = useFeedStore();
  const { user } = useUserStore();

  useEffect(() => {
    getFeed();
  }, [getFeed]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    await createPost(newPostContent);
    setNewPostContent('');
  };

  const handleLikePost = async (postId: string) => {
    await likePost(postId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl text-orange-500">피드를 불러오는 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-1 flex gap-6 px-8 py-6">
        {/* Left Sidebar */}
        <aside className="w-64 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-bold mb-2">내 온도</div>
            <div className="text-orange-500 font-bold text-lg">{user?.temperature || 36.5}℃</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-bold mb-2">인기 태그</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">#도서관</span>
              <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">#스터디</span>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">#맛집</span>
            </div>
          </div>
        </aside>
        
        {/* Feed */}
        <section className="flex-1 flex flex-col gap-4">
          {/* 게시글 작성 폼 */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-bold">
              {user?.nickname?.charAt(0) || '사'}
            </span>
            <form onSubmit={handleCreatePost} className="flex-1 flex items-center gap-2">
              <input 
                className="flex-1 px-4 py-2 rounded-full border bg-gray-50" 
                placeholder="오늘 어떤 따뜻한 일이 있었나요? 함께 나눠보세요!" 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-full font-bold"
                disabled={!newPostContent.trim()}
              >
                게시하기
              </button>
            </form>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 피드 카드들 */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-bold">
                  {post.author.nickname}
                </span>
                <span className="text-orange-500 font-bold">{post.author.temperature}℃</span>
              </div>
              <div className="text-gray-800">{post.content}</div>
              <div className="flex gap-4 text-gray-500 text-sm mt-2">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center gap-1 hover:text-orange-500"
                >
                  🤍 {post.likes}
                </button>
                <span className="flex items-center gap-1">💬 {post.comments}</span>
                <span className="flex items-center gap-1">🔁 {post.shares}</span>
              </div>
            </div>
          ))}

          {/* 게시글이 없을 때 */}
          {posts.length === 0 && !isLoading && (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
            </div>
          )}
        </section>
        
        {/* Right Widgets */}
        <aside className="w-72 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-bold mb-2">실시간 온도</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>따뜻한친구</span>
                <span className="text-orange-500 font-bold">85.2℃</span>
              </div>
              <div className="flex justify-between">
                <span>공부맨</span>
                <span className="text-orange-500 font-bold">72.1℃</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-bold mb-2">추천 팔로우</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">김</span>
                <span className="text-sm">따뜻한친구</span>
                <button className="ml-auto bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">팔로우</button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}