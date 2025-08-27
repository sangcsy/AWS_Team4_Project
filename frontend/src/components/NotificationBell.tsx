import React, { useState, useEffect } from 'react';
import './NotificationBell.css';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  post_id?: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    nickname: string;
  };
  post?: {
    title: string;
  };
}

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

                // 알림 목록 조회
              const fetchNotifications = async () => {
                try {
                  console.log('🔍 NotificationBell.fetchNotifications 시작');
                  const token = localStorage.getItem('token');
                  console.log('🔍 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
                  
                  const response = await fetch('http://localhost:3000/api/notifications', {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  console.log('🔍 API 응답 상태:', response.status, response.ok);
            
                  if (response.ok) {
                    const data = await response.json();
                    console.log('✅ 알림 데이터 수신:', data);
                    setNotifications(data.data.notifications);
                    setUnreadCount(data.data.unread_count);
                  } else {
                    console.error('❌ API 응답 실패:', response.status);
                    const errorText = await response.text();
                    console.error('❌ 에러 내용:', errorText);
                  }
                } catch (error) {
                  console.error('❌ 알림 조회 실패:', error);
                }
              };

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  };

  // 알림을 읽음으로 표시
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('알림 읽음 표시 실패:', error);
    }
  };

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('모든 알림 읽음 표시 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        // 삭제된 알림이 읽지 않았다면 개수 감소
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'mention':
        return '📢';
      default:
        return '🔔';
    }
  };

  // 알림 클릭 시 처리
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // 게시글이 있는 경우 해당 게시글로 이동
    if (notification.post_id) {
      // TODO: 게시글로 이동하는 로직 구현
      console.log('게시글로 이동:', notification.post_id);
    }
    
    setIsOpen(false);
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId]);

  return (
    <div className="notification-bell">
      <button 
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="알림"
      >
        {unreadCount > 0 ? (
          <span className="notification-icon active">🔔</span>
        ) : (
          <span className="notification-icon">🔔</span>
        )}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>알림</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '모두 읽음'}
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>새로운 알림이 없습니다.</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon-small">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">{notification.content}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTime(notification.created_at)}
                      </span>
                      {notification.post && (
                        <span className="notification-post">
                          {notification.post.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="알림 삭제"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
