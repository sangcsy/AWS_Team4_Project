import { v4 as uuidv4 } from 'uuid';
import { databaseConnection } from '../../shared/database';
import { Post, PostRepository, PostCreateData, PostUpdateData } from '../../../domain/post/Post';

export class PostRepositoryImpl implements PostRepository {
  constructor() {
    this.initializeTable();
  }

  private async initializeTable() {
    try {
      const pool = await databaseConnection.getPool();
      
      // posts 테이블에 likes 컬럼이 있는지 확인
      const [likesColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'tempus_db' 
        AND TABLE_NAME = 'posts' 
        AND COLUMN_NAME = 'likes'
      `);
      
      // likes 컬럼이 없다면 추가
      if (likesColumns.length === 0) {
        await pool.execute(`
          ALTER TABLE posts 
          ADD COLUMN likes INT DEFAULT 0
        `);
        console.log('✅ likes 컬럼 추가 완료');
      } else {
        console.log('✅ likes 컬럼이 이미 존재합니다');
      }

      // posts 테이블에 category 컬럼이 있는지 확인
      const [categoryColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'tempus_db' 
        AND TABLE_NAME = 'posts' 
        AND COLUMN_NAME = 'category'
      `);
      
      // category 컬럼이 없다면 추가
      if (categoryColumns.length === 0) {
        await pool.execute(`
          ALTER TABLE posts 
          ADD COLUMN category VARCHAR(50) DEFAULT '자유'
        `);
        console.log('✅ category 컬럼 추가 완료');
      } else {
        console.log('✅ category 컬럼이 이미 존재합니다');
      }
      
      console.log('✅ Posts 테이블 초기화 완료');
    } catch (error) {
      console.error('❌ Posts 테이블 초기화 실패:', error);
    }
  }

  async create(postData: PostCreateData, userId: string): Promise<Post> {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO posts (id, user_id, title, content, category, temperature_change, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, postData.title, postData.content, postData.category || '자유', postData.temperature_change || 0.0, now, now]
    );

    return {
      id,
      user_id: userId,
      title: postData.title,
      content: postData.content,
      category: postData.category || '자유',
      temperature_change: postData.temperature_change || 0.0,
      created_at: now,
      updated_at: now
    };
  }

  async findById(id: string): Promise<Post | null> {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      category: row.category || '자유',
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  async findByUserId(userId: string, page = 1, limit = 10): Promise<{ posts: Post[], total: number }> {
    const pool = await databaseConnection.getPool();
    const offset = (page - 1) * limit;
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM posts WHERE user_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    // 게시글 목록 조회 - MySQL LIMIT offset, count 구문 사용
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
      [userId, offset, limit]
    );

    const posts = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      category: row.category || '자유',
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return { posts, total };
  }

  async findAll(page = 1, limit = 10, currentUserId?: string): Promise<{ posts: Post[], total: number }> {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    console.log('PostRepositoryImpl.findAll - params:', { page: pageNum, limit: limitNum, offset, currentUserId });
    
    // 전체 개수 조회
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    const total = countRows[0].total;

    // 게시글 목록 조회 - 사용자 정보와 함께 JOIN
    const query = `
      SELECT 
        p.*,
        u.nickname,
        u.temperature,
        u.email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC 
      LIMIT ${Number(offset)}, ${Number(limitNum)}
    `;
    console.log('PostRepositoryImpl.findAll - query:', query);
    
    const [rows] = await pool.execute(query);

    // 각 게시글에 대해 댓글과 좋아요 정보 조회
    const posts = await Promise.all(rows.map(async (row) => {
      // 댓글 조회
      const [commentRows] = await pool.execute(`
        SELECT 
          c.*,
          u.nickname
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `, [row.id]);

      // 좋아요 수 조회
      const [likesResult] = await pool.execute(
        'SELECT COALESCE(likes, 0) as likes FROM posts WHERE id = ?',
        [row.id]
      );

      // 현재 사용자의 좋아요 상태 확인
      let isLiked = false;
      if (currentUserId) {
        const [likeStatusResult] = await pool.execute(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?',
          [row.id, currentUserId]
        );
        isLiked = likeStatusResult[0]?.count > 0;
      }

      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        category: row.category || '자유', // 카테고리 필드 추가
        temperature_change: parseFloat(row.temperature_change),
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        user: {
          nickname: row.nickname || '알 수 없음',
          temperature: row.temperature || 36.5,
          email: row.email || ''
        },
        likes: likesResult[0]?.likes || 0,
        isLiked: isLiked,
        comments: commentRows.map((comment: any) => ({
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            nickname: comment.nickname || '알 수 없음'
          }
        }))
      };
    }));

    return { posts, total };
  }

  async update(id: string, updates: PostUpdateData, userId: string): Promise<Post> {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    let updateFields: string[] = [];
    let updateValues: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }

    if (updates.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(updates.content);
    }

    if (updates.temperature_change !== undefined) {
      updateFields.push('temperature_change = ?');
      updateValues.push(updates.temperature_change);
    }

    if (updateFields.length === 0) {
      throw new Error('업데이트할 내용이 없습니다.');
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    await pool.execute(
      `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updatedPost = await this.findById(id);
    if (!updatedPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    return updatedPost;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const pool = await databaseConnection.getPool();
    await pool.execute('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }

  async updateTemperature(id: string, temperatureChange: number): Promise<Post> {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    // 현재 게시글 조회
    const currentPost = await this.findById(id);
    if (!currentPost) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 새 온도 변화 계산
    const newTemperatureChange = currentPost.temperature_change + temperatureChange;

    await pool.execute(
      'UPDATE posts SET temperature_change = ?, updated_at = ? WHERE id = ?',
      [newTemperatureChange, now, id]
    );

    return {
      ...currentPost,
      temperature_change: newTemperatureChange,
      updated_at: now
    };
  }

  // 좋아요 토글
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    const pool = await databaseConnection.getPool();
    
    // 좋아요 테이블이 존재하는지 확인하고, 없다면 생성
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS post_likes (
          id VARCHAR(36) PRIMARY KEY,
          post_id VARCHAR(36) NOT NULL,
          user_id VARCHAR(36) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_post_user (post_id, user_id),
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } catch (error) {
      console.error('좋아요 테이블 생성 실패:', error);
    }

    // 현재 좋아요 상태 확인
    const [existingLikes] = await pool.execute(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      // 좋아요 취소
      await pool.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      // 좋아요 수 감소
      await pool.execute(
        'UPDATE posts SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE id = ?',
        [postId]
      );

      // 현재 좋아요 수 조회
      const [likesResult] = await pool.execute(
        'SELECT COALESCE(likes, 0) as likes FROM posts WHERE id = ?',
        [postId]
      );

      return {
        liked: false,
        likes: likesResult[0]?.likes || 0
      };
    } else {
      // 좋아요 추가
      const likeId = uuidv4();
      await pool.execute(
        'INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)',
        [likeId, postId, userId]
      );

      // 좋아요 수 증가
      await pool.execute(
        'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ?',
        [postId]
      );

      // 현재 좋아요 수 조회
      const [likesResult] = await pool.execute(
        'SELECT COALESCE(likes, 0) as likes FROM posts WHERE id = ?',
        [postId]
      );

      return {
        liked: true,
        likes: likesResult[0]?.likes || 0
      };
    }
  }

  // 게시글 검색
  async searchPosts(query: string): Promise<{ posts: Post[], total: number }> {
    const pool = await databaseConnection.getPool();
    
    // 검색 쿼리 (제목과 내용에서 검색)
    const searchQuery = `
      SELECT 
        p.*,
        u.nickname,
        u.temperature,
        u.email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.title LIKE ? OR p.content LIKE ?
      ORDER BY p.created_at DESC
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(searchQuery, [searchTerm, searchTerm]);
    
    // 검색 결과에 댓글과 좋아요 정보 추가
    const posts = await Promise.all(rows.map(async (row) => {
      // 댓글 조회
      const [commentRows] = await pool.execute(`
        SELECT 
          c.*,
          u.nickname
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `, [row.id]);

      // 좋아요 수 조회
      const [likesResult] = await pool.execute(
        'SELECT COALESCE(likes, 0) as likes FROM posts WHERE id = ?',
        [row.id]
      );

             return {
         id: row.id,
         user_id: row.user_id,
         title: row.title,
         content: row.content,
         category: row.category || '자유',
         temperature_change: parseFloat(row.temperature_change),
         created_at: new Date(row.created_at),
         updated_at: new Date(row.updated_at),
         user: {
           nickname: row.nickname || '알 수 없음',
           temperature: row.temperature || 36.5,
           email: row.email || ''
         },
         likes: likesResult[0]?.likes || 0,
         isLiked: false,
         comments: commentRows.map((comment: any) => ({
           id: comment.id,
           post_id: comment.post_id,
           user_id: comment.user_id,
           content: comment.content,
           created_at: comment.created_at,
           user: {
             nickname: comment.nickname || '알 수 없음'
           }
         }))
       };
    }));

    return { posts, total: posts.length };
  }
}