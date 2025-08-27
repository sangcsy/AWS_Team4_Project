const { v4: uuidv4 } = require('uuid');
const { databaseConnection } = require('../../shared/database');

class UserRepositoryImpl {
  async create(userData) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO users (id, email, password_hash, nickname, temperature, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userData.email, userData.password_hash, userData.nickname, 36.5, now, now]
    );

    return {
      id,
      email: userData.email,
      password_hash: userData.password_hash,
      nickname: userData.nickname,
      temperature: 36.5,
      created_at: now,
      updated_at: now
    };
  }

  async findById(id) {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      nickname: row.nickname,
      temperature: parseFloat(row.temperature),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  async findByEmail(email) {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      nickname: row.nickname,
      temperature: parseFloat(row.temperature),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  async findByNickname(nickname) {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE nickname = ?',
      [nickname]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      nickname: row.nickname,
      temperature: parseFloat(row.temperature),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  // 사용자 검색 메서드 추가
  async searchByNickname(searchQuery) {
    const pool = await databaseConnection.getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE nickname LIKE ? ORDER BY nickname LIMIT 20',
      [`%${searchQuery}%`]
    );

    return rows.map(row => ({
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      nickname: row.nickname,
      temperature: parseFloat(row.temperature),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));
  }

  async update(id, updates) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    let updateFields = [];
    let updateValues = [];

    if (updates.nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(updates.nickname);
    }

    if (updates.temperature !== undefined) {
      updateFields.push('temperature = ?');
      updateValues.push(updates.temperature);
    }

    if (updateFields.length === 0) {
      throw new Error('업데이트할 내용이 없습니다.');
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return updatedUser;
  }

  async delete(id) {
    const pool = await databaseConnection.getPool();
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  async updateTemperature(id, temperatureChange) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    // 현재 온도 조회
    const currentUser = await this.findById(id);
    if (!currentUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 새 온도 계산 (36.5 ~ 42.0 범위 제한)
    const newTemperature = Math.max(36.5, Math.min(42.0, currentUser.temperature + temperatureChange));

    await pool.execute(
      'UPDATE users SET temperature = ?, updated_at = ? WHERE id = ?',
      [newTemperature, now, id]
    );

    return {
      ...currentUser,
      temperature: newTemperature,
      updated_at: now
    };
  }
}

module.exports = { UserRepositoryImpl };
