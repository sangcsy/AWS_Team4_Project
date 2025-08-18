const { v4: uuidv4 } = require('uuid');
const { databaseConnection } = require('../../shared/database');

class MyRoomRepositoryImpl {
  async create(userId, data) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    // 사용자의 현재 온도 조회
    const [userRows] = await pool.execute(
      'SELECT temperature FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    const currentTemperature = userRows[0].temperature;
    
    const [result] = await pool.execute(
      'INSERT INTO users (id, email, password_hash, nickname, temperature, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = id',
      [userId, '', '', '', currentTemperature, now, now]
    );

    return {
      id: userId,
      user_id: userId,
      profile_image: data.profile_image || null,
      bio: data.bio || null,
      current_temperature: currentTemperature,
      created_at: now,
      updated_at: now
    };
  }

  async findByUserId(userId) {
    const pool = await databaseConnection.getPool();
    
    // 사용자 정보 조회
    const [userRows] = await pool.execute(
      'SELECT id, temperature, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return null;
    }
    
    const user = userRows[0];
    
    return {
      id: user.id,
      user_id: user.id,
      profile_image: null, // 향후 확장
      bio: null, // 향후 확장
      current_temperature: parseFloat(user.temperature),
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    };
  }

  async update(userId, data) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    // 현재 마이룸 정보 조회
    const currentMyRoom = await this.findByUserId(userId);
    if (!currentMyRoom) {
      throw new Error('마이룸을 찾을 수 없습니다.');
    }
    
    // 업데이트할 필드들
    const updateFields = [];
    const updateValues = [];
    
    if (data.profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      updateValues.push(data.profile_image);
    }
    
    if (data.bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(data.bio);
    }
    
    if (updateFields.length === 0) {
      return currentMyRoom;
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(userId);
    
    // 실제 업데이트는 향후 별도 테이블로 확장
    // 현재는 사용자 테이블의 updated_at만 업데이트
    
    return {
      ...currentMyRoom,
      profile_image: data.profile_image !== undefined ? data.profile_image : currentMyRoom.profile_image,
      bio: data.bio !== undefined ? data.bio : currentMyRoom.bio,
      updated_at: now
    };
  }

  async delete(userId) {
    // 마이룸 삭제는 사용자 삭제와 함께 처리
    // 실제로는 별도 삭제 로직이 필요할 수 있음
    console.log(`MyRoom deleted for user: ${userId}`);
  }

  async updateTemperature(userId, temperatureChange) {
    const pool = await databaseConnection.getPool();
    const now = new Date();
    
    // 현재 온도 조회
    const [userRows] = await pool.execute(
      'SELECT temperature FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    const currentTemperature = parseFloat(userRows[0].temperature);
    const newTemperature = Math.max(0, Math.min(100, currentTemperature + temperatureChange));
    
    // 온도 업데이트
    await pool.execute(
      'UPDATE users SET temperature = ?, updated_at = ? WHERE id = ?',
      [newTemperature, now, userId]
    );
    
    return {
      id: userId,
      user_id: userId,
      profile_image: null,
      bio: null,
      current_temperature: newTemperature,
      created_at: new Date(),
      updated_at: now
    };
  }

  async addItem(myroomId, itemData) {
    const pool = await databaseConnection.getPool();
    const id = uuidv4();
    const now = new Date();
    
    const [result] = await pool.execute(
      'INSERT INTO myroom_items (id, myroom_id, name, description, item_type, rarity, acquired_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, myroomId, itemData.name, itemData.description, itemData.item_type, itemData.rarity, itemData.acquired_at, now]
    );

    return {
      id,
      myroom_id: myroomId,
      name: itemData.name,
      description: itemData.description,
      item_type: itemData.item_type,
      rarity: itemData.rarity,
      acquired_at: itemData.acquired_at,
      created_at: now
    };
  }

  async getItems(myroomId) {
    const pool = await databaseConnection.getPool();
    
    const [rows] = await pool.execute(
      'SELECT * FROM myroom_items WHERE myroom_id = ? ORDER BY created_at DESC',
      [myroomId]
    );

    return rows.map(row => ({
      id: row.id,
      myroom_id: row.myroom_id,
      name: row.name,
      description: row.description,
      item_type: row.item_type,
      rarity: row.rarity,
      acquired_at: new Date(row.acquired_at),
      created_at: new Date(row.created_at)
    }));
  }

  async removeItem(itemId, myroomId) {
    const pool = await databaseConnection.getPool();
    
    await pool.execute(
      'DELETE FROM myroom_items WHERE id = ? AND myroom_id = ?',
      [itemId, myroomId]
    );
  }

  async getTemperatureHistory(userId, limit = 10) {
    // 향후 온도 히스토리 테이블 구현 시 사용
    return [];
  }
}

module.exports = { MyRoomRepositoryImpl };
