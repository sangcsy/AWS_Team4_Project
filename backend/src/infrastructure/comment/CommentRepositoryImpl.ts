const { v4: uuidv4 } = require('uuid');
const { databaseConnection } = require('../../shared/database');

class CommentRepositoryImpl {
  async create(commentData, postId, userId) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO comments (id, post_id, user_id, content, temperature_change, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, postId, userId, commentData.content, commentData.temperature_change || 0.0, now, now]
    );

    return {
      id,
      post_id: postId,
      user_id: userId,
      content: commentData.content,
      temperature_change: commentData.temperature_change || 0.0,
      created_at: now,
      updated_at: now
    };
  }

  async findById(id) {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM comments WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  async findByPostId(postId, page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    
    // 파라미터를 확실하게 정수로 변환
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    console.log('CommentRepositoryImpl.findByPostId - params:', { postId, page: pageNum, limit: limitNum, offset });
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ?',
      [postId]
    );
    const total = countRows[0].total;

    // 댓글 목록 조회 - 문자열 연결 방식 사용
    const query = `SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC LIMIT ${offset}, ${limitNum}`;
    console.log('CommentRepositoryImpl.findByPostId - query:', query);
    
    const [rows] = await pool.execute(query, [postId]);

    const comments = rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return { comments, total };
  }

  async findByUserId(userId, page = 1, limit = 10) {
    const pool = await databaseConnection.getPool();
    const offset = (page - 1) * limit;
    
    // 전체 개수 조회
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE user_id = ?',
      [userId]
    );
    const total = countRows[0].total;

    // 댓글 목록 조회 - MySQL LIMIT offset, count 구문 사용
    const [rows] = await pool.execute(
      'SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?, ?',
      [userId, offset, limit]
    );

    const comments = rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      content: row.content,
      temperature_change: parseFloat(row.temperature_change),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return { comments, total };
  }

  async update(id, updates, userId) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    let updateFields = [];
    let updateValues = [];

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
      `UPDATE comments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updatedComment = await this.findById(id);
    if (!updatedComment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    return updatedComment;
  }

  async delete(id, userId) {
    const pool = await databaseConnection.getPool();
    await pool.execute('DELETE FROM comments WHERE id = ? AND user_id = ?', [id, userId]);
  }

  async updateTemperature(id, temperatureChange) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    // 현재 댓글 조회
    const currentComment = await this.findById(id);
    if (!currentComment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    // 새 온도 변화 계산
    const newTemperatureChange = currentComment.temperature_change + temperatureChange;

    await pool.execute(
      'UPDATE comments SET temperature_change = ?, updated_at = ? WHERE id = ?',
      [newTemperatureChange, now, id]
    );

    return {
      ...currentComment,
      temperature_change: newTemperatureChange,
      updated_at: now
    };
  }
}

module.exports = { CommentRepositoryImpl };
