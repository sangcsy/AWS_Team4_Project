import mysql from 'mysql2/promise';

// 데이터베이스 설정
const dbConfig = {
  host: process.env['DB_HOST'] || 'kusj-pj-4-rds.c89gcme2mmcs.us-east-1.rds.amazonaws.com',
  user: process.env['DB_USER'] || 'admin',
  password: process.env['DB_PASSWORD'] || '12345678aA',
  database: process.env['DB_NAME'] || 'tempus_db',
  port: parseInt(process.env['DB_PORT'] || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 데이터베이스 연결 풀 생성
let pool: mysql.Pool | null = null;

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {}
  
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
  
  // 데이터베이스 생성 (없는 경우)
  private async createDatabaseIfNotExists(): Promise<void> {
    try {
      // 데이터베이스 없이 연결 (mysql 시스템 데이터베이스 사용)
      const systemConfig = {
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
      };
      
      const systemPool = mysql.createPool(systemConfig);
      
      // 데이터베이스 생성
      await systemPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
      console.log(`✅ Database '${dbConfig.database}' created or already exists`);
      
      await systemPool.end();
    } catch (error) {
      console.error('❌ Failed to create database:', error);
      throw error;
    }
  }
  
  // 연결 풀 가져오기
  public async getPool(): Promise<mysql.Pool> {
    if (!pool) {
      try {
        // 먼저 데이터베이스 생성
        await this.createDatabaseIfNotExists();
        
        // 그 다음 연결 풀 생성
        pool = mysql.createPool(dbConfig);
        console.log('✅ Database connection pool created successfully');
      } catch (error) {
        console.error('❌ Failed to create database connection pool:', error);
        throw error;
      }
    }
    return pool;
  }
  
  // 연결 테스트
  public async testConnection(): Promise<boolean> {
    try {
      const pool = await this.getPool();
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
  
  // 테이블 생성
  public async createTables(): Promise<void> {
    try {
      const pool = await this.getPool();
      
      // users 테이블
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          nickname VARCHAR(100) UNIQUE NOT NULL,
          temperature DECIMAL(3,1) DEFAULT 36.5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // posts 테이블
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          temperature_change DECIMAL(3,1) DEFAULT 0.0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // comments 테이블
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS comments (
          id VARCHAR(36) PRIMARY KEY,
          post_id VARCHAR(36) NOT NULL,
          user_id VARCHAR(36) NOT NULL,
          content TEXT NOT NULL,
          temperature_change DECIMAL(3,1) DEFAULT 0.0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // follows 테이블
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS follows (
          id VARCHAR(36) PRIMARY KEY,
          follower_id VARCHAR(36) NOT NULL,
          following_id VARCHAR(36) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_follow (follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // myroom_items 테이블
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS myroom_items (
          id VARCHAR(36) PRIMARY KEY,
          myroom_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          item_type ENUM('DECORATION', 'BADGE', 'TROPHY', 'SPECIAL') NOT NULL,
          rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL,
          acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (myroom_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Failed to create database tables:', error);
      throw error;
    }
  }
  
  // 연결 풀 종료
  public async closePool(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('✅ Database connection pool closed');
    }
  }
}

// 기본 export
export const databaseConnection = DatabaseConnection.getInstance();
export const createTables = () => databaseConnection.createTables();
export const testConnection = () => databaseConnection.testConnection();
