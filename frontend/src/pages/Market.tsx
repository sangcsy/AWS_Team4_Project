import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useMarketStore } from '../store/marketStore';
import { useUserStore } from '../store/userStore';

const categories = [
  { id: 'all', name: '전체' },
  { id: 'electronics', name: '전자기기' },
  { id: 'books', name: '도서' },
  { id: 'clothing', name: '의류' },
  { id: 'furniture', name: '가구' },
  { id: 'talent', name: '재능' },
];

export default function Market() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { items, isLoading, error, getMarketItems, getMarketItemsByCategory } = useMarketStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (selectedCategory === 'all') {
      getMarketItems();
    } else {
      getMarketItemsByCategory(selectedCategory);
    }
  }, [selectedCategory, getMarketItems, getMarketItemsByCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl text-orange-500">마켓을 불러오는 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-purple-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl flex flex-col gap-6">
          <div className="text-2xl font-bold text-orange-500 text-center mb-4">캠퍼스 마켓</div>
          
          {/* 카테고리 필터 */}
          <div className="flex gap-2 justify-center mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full font-bold ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 상품 등록 버튼 */}
          <div className="text-center mb-6">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full">
              상품 등록하기
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* 상품 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{item.title}</div>
                    <div className="text-sm text-gray-600 mb-2">{item.description}</div>
                    <div className="text-orange-500 font-bold text-lg">
                      {item.price.toLocaleString()}원
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
                    {item.condition}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                        {item.seller.nickname.charAt(0)}
                      </span>
                      <span>{item.seller.nickname}</span>
                    </div>
                    <div className="text-orange-500 font-bold">
                      {item.seller.temperature}℃
                    </div>
                  </div>
                  {item.seller.averageRating > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      평점: ⭐ {item.seller.averageRating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 상품이 없을 때 */}
          {items.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">아직 등록된 상품이 없습니다.</div>
              <div className="text-sm">첫 번째 상품을 등록해보세요!</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}