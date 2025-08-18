const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔌 Testing database connection...');
  console.log('Environment variables:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PORT:', process.env.DB_PORT);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 10000, // 10초 타임아웃
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    });
    
    console.log('✅ Database connection successful!');
    
    // 데이터베이스 목록 조회
    const [rows] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:');
    rows.forEach(row => console.log('  -', row.Database));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
