import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './RandomChat.css';

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  isMyMessage: boolean;
}

interface MatchingUser {
  id: string;
  nickname: string;
  temperature: number;
}

export default function RandomChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchedUser, setMatchedUser] = useState<MatchingUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [matchingPreferences, setMatchingPreferences] = useState({
    preferredGender: 'all',
    minAge: 18,
    maxAge: 30,
    matchingAlgorithm: 'random'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Socket.io 연결
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket 연결됨');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket 연결 해제됨');
      setIsConnected(false);
    });

    newSocket.on('matching-joined', (data) => {
      console.log('🎯 매칭 대기열 등록:', data);
    });

    newSocket.on('matching-requested', (data) => {
      console.log('🔍 매칭 요청됨:', data);
    });

    newSocket.on('matching-success', (data) => {
      console.log('✅ 매칭 성공:', data);
      setIsMatched(true);
      setMatchedUser(data.matchedUser);
      setIsMatching(false);
    });

    newSocket.on('receive-message', (messageData) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: messageData.senderId,
        message: messageData.message,
        timestamp: new Date(),
        isMyMessage: false
      };
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 매칭 시작
  const startMatching = () => {
    if (!socket || !isConnected) return;
    
    setIsMatching(true);
    setIsMatched(false);
    setMessages([]);
    
    socket.emit('join-matching', {
      userId: currentUser.id,
      preferences: matchingPreferences
    });
    
    socket.emit('request-matching', {
      userId: currentUser.id,
      preferences: matchingPreferences
    });
  };

  // 매칭 중단
  const stopMatching = () => {
    if (!socket) return;
    
    setIsMatching(false);
    socket.emit('leave-matching', { userId: currentUser.id });
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !isMatched) return;
    
    const messageData = {
      roomId: 'matching-room',
      senderId: currentUser.id,
      message: newMessage.trim()
    };
    
    socket.emit('send-message', messageData);
    
    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      message: newMessage.trim(),
      timestamp: new Date(),
      isMyMessage: true
    };
    
    setMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');
  };

  // 매칭 종료
  const endMatching = () => {
    if (!socket) return;
    
    setIsMatched(false);
    setMatchedUser(null);
    setMessages([]);
    socket.emit('end-matching', { userId: currentUser.id });
  };

  return (
    <div className="random-chat">
      <div className="chat-header">
        <h2>🎯 랜덤채팅</h2>
        <div className="connection-status">
          {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
        </div>
      </div>

      {!isMatched && !isMatching && (
        <div className="matching-setup">
          <h3>매칭 설정</h3>
          <div className="preferences-form">
            <div className="preference-item">
              <label>선호 성별:</label>
              <select
                value={matchingPreferences.preferredGender}
                onChange={(e) => setMatchingPreferences(prev => ({
                  ...prev,
                  preferredGender: e.target.value
                }))}
              >
                <option value="all">상관없음</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
            
            <div className="preference-item">
              <label>나이 범위:</label>
              <div className="age-range">
                <input
                  type="number"
                  min="18"
                  max="50"
                  value={matchingPreferences.minAge}
                  onChange={(e) => setMatchingPreferences(prev => ({
                    ...prev,
                    minAge: parseInt(e.target.value)
                  }))}
                />
                <span>~</span>
                <input
                  type="number"
                  min="18"
                  max="50"
                  value={matchingPreferences.maxAge}
                  onChange={(e) => setMatchingPreferences(prev => ({
                    ...prev,
                    maxAge: parseInt(e.target.value)
                  }))}
                />
              </div>
            </div>
            
            <div className="preference-item">
              <label>매칭 알고리즘:</label>
              <select
                value={matchingPreferences.matchingAlgorithm}
                onChange={(e) => setMatchingPreferences(prev => ({
                  ...prev,
                  matchingAlgorithm: e.target.value
                }))}
              >
                <option value="random">랜덤 매칭</option>
                <option value="tempus">온도 기반 매칭</option>
              </select>
            </div>
          </div>
          
          <button
            className="btn primary full"
            onClick={startMatching}
            disabled={!isConnected}
          >
            🎯 매칭 시작하기
          </button>
        </div>
      )}

      {isMatching && (
        <div className="matching-status">
          <div className="matching-animation">
            <div className="spinner"></div>
            <h3>매칭 중...</h3>
            <p>적절한 상대방을 찾고 있습니다</p>
          </div>
          <button
            className="btn ghost"
            onClick={stopMatching}
          >
            ❌ 매칭 중단
          </button>
        </div>
      )}

      {isMatched && matchedUser && (
        <div className="chat-room">
          <div className="matched-user-info">
            <h3>🎉 매칭 성공!</h3>
            <div className="user-card">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <h4>{matchedUser.nickname}</h4>
                <p>🔥 {matchedUser.temperature}℃</p>
              </div>
            </div>
            <button
              className="btn ghost small"
              onClick={endMatching}
            >
              🚪 채팅 종료
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>💬 첫 번째 메시지를 보내보세요!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isMyMessage ? 'my-message' : 'other-message'}`}
                >
                  <div className="message-content">
                    {message.message}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="메시지를 입력하세요..."
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
            >
              📤 전송
            </button>
          </div>
        </div>
      )}

      <div className="chat-tips">
        <h4>💡 채팅 팁</h4>
        <ul>
          <li>상대방을 존중하는 마음으로 대화하세요</li>
          <li>개인정보나 연락처는 공유하지 마세요</li>
          <li>부적절한 대화 시 신고할 수 있습니다</li>
          <li>대화 품질에 따라 온도가 변화합니다</li>
        </ul>
      </div>
    </div>
  );
}
