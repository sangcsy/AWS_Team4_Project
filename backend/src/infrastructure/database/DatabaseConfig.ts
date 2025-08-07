import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: mysql.Connection | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      const config: DatabaseConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tempus_db',
        port: parseInt(process.env.DB_PORT || '3306')
      };

      this.connection = await mysql.createConnection(config);
      console.log('✅ Database connected successfully');
    }
    return this.connection;
  }

  public async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Database connection closed');
    }
  }

  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = await this.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  }

  public async transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    await connection.beginTransaction();
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}

// 테이블 생성 스크립트
export const createTables = async () => {
  const db = DatabaseConnection.getInstance();
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(50) UNIQUE NOT NULL,
      temperature DECIMAL(5,2) DEFAULT 36.5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(36) PRIMARY KEY,
      content TEXT NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      likes INT DEFAULT 0,
      comments INT DEFAULT 0,
      shares INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(36) PRIMARY KEY,
      content TEXT NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS follows (
      id VARCHAR(36) PRIMARY KEY,
      follower_id VARCHAR(36) NOT NULL,
      following_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_follow (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS myroom_items (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS market_items (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      price INT NOT NULL,
      category VARCHAR(50) NOT NULL,
      condition VARCHAR(50) NOT NULL,
      seller_id VARCHAR(36) NOT NULL,
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(36) PRIMARY KEY,
      reviewer_id VARCHAR(36) NOT NULL,
      seller_id VARCHAR(36) NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const table of tables) {
    await db.query(table);
  }
  
  console.log('✅ Database tables created successfully');
};

export default DatabaseConnection;
