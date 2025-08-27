-- notifications 테이블 수정 스크립트

-- 1. sender_id 컬럼 추가
ALTER TABLE notifications ADD COLUMN sender_id VARCHAR(36) NOT NULL AFTER user_id;

-- 2. post_id 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN post_id VARCHAR(36) AFTER sender_id;

-- 3. type 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN type VARCHAR(20) NOT NULL AFTER post_id;

-- 4. content 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN content TEXT NOT NULL AFTER type;

-- 5. is_read 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE AFTER content;

-- 6. created_at 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_read;

-- 7. updated_at 컬럼 추가 (필요시)
ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 8. 외래 키 제약 조건 추가
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 9. 인덱스 추가
ALTER TABLE notifications ADD INDEX idx_user_id (user_id);
ALTER TABLE notifications ADD INDEX idx_created_at (created_at);
ALTER TABLE notifications ADD INDEX idx_is_read (is_read);

-- 10. 테이블 구조 확인
DESCRIBE notifications;
