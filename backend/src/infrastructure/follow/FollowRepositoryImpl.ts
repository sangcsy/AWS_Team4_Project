const { v4: uuidv4 } = require('uuid');
const { databaseConnection } = require('../../shared/database');

class FollowRepositoryImpl {
  async create(followerId, data) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)',
      [id, followerId, data.following_id, now]
    );

    return {
      id,
      follower_id: followerId,
      following_id: data.following_id,
      created_at: now
    };
  }

  async delete(followerId, followingId) {
    const pool = await databaseConnection.getPool();
    
    await pool.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
  }

  async exists(followerId, followingId) {
    const pool = await databaseConnection.getPool();
    
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    
    return rows[0].count > 0;
  }

  async getFollowers(userId, page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM follows WHERE following_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    // 팔로워 목록 조회
    const query = `SELECT * FROM follows WHERE following_id = ? ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;
    const [rows] = await pool.execute(query, [userId]);

    const follows = rows.map(row => ({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      created_at: new Date(row.created_at)
    }));

    return { follows, total, page: pageNum, limit: limitNum };
  }

  async getFollowing(userId, page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM follows WHERE follower_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    // 팔로잉 목록 조회
    const query = `SELECT * FROM follows WHERE follower_id = ? ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;
    const [rows] = await pool.execute(query, [userId]);

    const follows = rows.map(row => ({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      created_at: new Date(row.created_at)
    }));

    return { follows, total, page: pageNum, limit: limitNum };
  }

  async getFollowStats(userId) {
    const pool = await databaseConnection.getPool();
    
    // 팔로워 수 조회
    const [followerRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [userId]
    );
    
    // 팔로잉 수 조회
    const [followingRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [userId]
    );
    
    return {
      follower_count: followerRows[0].count,
      following_count: followingRows[0].count
    };
  }

  async isFollowing(followerId, followingId) {
    return await this.exists(followerId, followingId);
  }

  async getMutualFollows(userId, page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    // 상호 팔로우 관계 조회 (양방향 팔로우)
    const query = `
      SELECT f1.* FROM follows f1
      INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
      WHERE f1.follower_id = ? OR f1.following_id = ?
      ORDER BY f1.created_at DESC
      LIMIT ${offset}, ${limitNum}
    `;
    
    const [rows] = await pool.execute(query, [userId, userId]);
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total FROM (
        SELECT f1.* FROM follows f1
        INNER JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
        WHERE f1.follower_id = ? OR f1.following_id = ?
      ) as mutual
    `, [userId, userId]);
    
    const total = countRows[0].total;

    const follows = rows.map(row => ({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      created_at: new Date(row.created_at)
    }));

    return { follows, total, page: pageNum, limit: limitNum };
  }
}

module.exports = { FollowRepositoryImpl };
