import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-5xl font-bold text-orange-400 mb-4">404</div>
      <div className="text-xl text-gray-600 mb-2">페이지를 찾을 수 없습니다.</div>
      <a href="/" className="text-blue-500 font-bold">홈으로 돌아가기</a>
    </div>
  );
}