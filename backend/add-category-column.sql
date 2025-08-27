-- posts 테이블에 category 컬럼 추가
ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT '자유';

-- 기존 게시글들의 category를 '자유'로 설정
UPDATE posts SET category = '자유' WHERE category IS NULL;

-- category 컬럼을 NOT NULL로 설정
ALTER TABLE posts MODIFY COLUMN category VARCHAR(50) NOT NULL DEFAULT '자유';
