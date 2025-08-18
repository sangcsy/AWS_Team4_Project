const { v4: uuidv4 } = require('uuid');
const { databaseConnection } = require('../../shared/database');

class PostRepositoryImpl {
  async create(postData, userId) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO posts (id, user_id, title, content, temperature_change, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, postData.title, postData.content, postData.temperature_change || 0.0, now, now]
    );

    return {
      id,
      user_id: userId,
      title: postData.title,
      content: postData.content,
      temperature_change: postData.temperature_change || 0.0,
      created_at: now,
      updated_at: now
    };
  }

  async findById(id) {
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
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  async findByUserId(userId, page = 1, limit = 10) {
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
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return { posts, total };
  }

  async findAll(page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    console.log('PostRepositoryImpl.findAll - params:', { page: pageNum, limit: limitNum, offset });
    
    // 전체 개수 조회
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM posts');
    const total = countRows[0].total;

    // 게시글 목록 조회 - 문자열 연결 방식 사용
    const query = `SELECT * FROM posts ORDER BY created_at DESC LIMIT ${offset}, ${limitNum}`;
    console.log('PostRepositoryImpl.findAll - query:', query);
    
    const [rows] = await pool.execute(query);

    const posts = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return { posts, total };
  }

  async update(id, updates, userId) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    let updateFields = [];
    let updateValues = [];

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

  async delete(id, userId) {
    const pool = await databaseConnection.getPool();
    await pool.execute('DELETE FROM posts WHERE id = ? AND user_id = ?', [id, userId]);
  }

  async updateTemperature(id, temperatureChange) {
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
}

module.exports = { PostRepositoryImpl };
