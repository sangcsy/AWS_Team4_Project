const mysql = require('mysql2/promise');

async function checkNotificationsTable() {
  let connection;
  
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'tempus_db'
    });

    console.log('✅ 데이터베이스 연결 성공');

    // notifications 테이블이 존재하는지 확인
    const [tables] = await connection.execute('SHOW TABLES LIKE "notifications"');
    
    if (tables.length === 0) {
      console.log('❌ notifications 테이블이 존재하지 않습니다.');
      return;
    }

    console.log('✅ notifications 테이블이 존재합니다.');

    // 테이블 구조 확인
    console.log('\n📋 notifications 테이블 구조:');
    const [describeResult] = await connection.execute('DESCRIBE notifications');
    describeResult.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // 필요한 컬럼들이 있는지 확인
    const requiredColumns = ['id', 'user_id', 'sender_id', 'post_id', 'type', 'content', 'is_read', 'created_at', 'updated_at'];
    const existingColumns = describeResult.map(row => row.Field);
    
    console.log('\n🔍 필요한 컬럼 확인:');
    requiredColumns.forEach(column => {
      if (existingColumns.includes(column)) {
        console.log(`  ✅ ${column}: 존재함`);
      } else {
        console.log(`  ❌ ${column}: 존재하지 않음`);
      }
    });

    // 누락된 컬럼이 있다면 추가
    const missingColumns = requiredColumns.filter(column => !existingColumns.includes(column));
    
    if (missingColumns.length > 0) {
      console.log('\n🔧 누락된 컬럼 추가 중...');
      
      for (const column of missingColumns) {
        let alterSQL = '';
        switch (column) {
          case 'sender_id':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN sender_id VARCHAR(36) NOT NULL AFTER user_id';
            break;
          case 'post_id':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN post_id VARCHAR(36) AFTER sender_id';
            break;
          case 'type':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN type VARCHAR(20) NOT NULL AFTER post_id';
            break;
          case 'content':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN content TEXT NOT NULL AFTER type';
            break;
          case 'is_read':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE AFTER content';
            break;
          case 'created_at':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_read';
            break;
          case 'updated_at':
            alterSQL = 'ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at';
            break;
        }
        
        if (alterSQL) {
          await connection.execute(alterSQL);
          console.log(`  ✅ ${column} 컬럼 추가 완료`);
        }
      }
      
      // 외래 키 제약 조건 추가
      try {
        await connection.execute('ALTER TABLE notifications ADD CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE');
        console.log('  ✅ sender_id 외래 키 제약 조건 추가 완료');
      } catch (error) {
        console.log('  ⚠️ sender_id 외래 키 제약 조건 추가 실패 (이미 존재할 수 있음)');
      }
      
      try {
        await connection.execute('ALTER TABLE notifications ADD CONSTRAINT fk_notifications_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE');
        console.log('  ✅ post_id 외래 키 제약 조건 추가 완료');
      } catch (error) {
        console.log('  ⚠️ post_id 외래 키 제약 조건 추가 실패 (이미 존재할 수 있음)');
      }
      
      // 인덱스 추가
      try {
        await connection.execute('ALTER TABLE notifications ADD INDEX idx_user_id (user_id)');
        console.log('  ✅ user_id 인덱스 추가 완료');
      } catch (error) {
        console.log('  ⚠️ user_id 인덱스 추가 실패 (이미 존재할 수 있음)');
      }
      
      try {
        await connection.execute('ALTER TABLE notifications ADD INDEX idx_created_at (created_at)');
        console.log('  ✅ created_at 인덱스 추가 완료');
      } catch (error) {
        console.log('  ⚠️ created_at 인덱스 추가 실패 (이미 존재할 수 있음)');
      }
      
      try {
        await connection.execute('ALTER TABLE notifications ADD INDEX idx_is_read (is_read)');
        console.log('  ✅ is_read 인덱스 추가 완료');
      } catch (error) {
        console.log('  ⚠️ is_read 인덱스 추가 실패 (이미 존재할 수 있음)');
      }
      
      // 업데이트된 테이블 구조 다시 확인
      console.log('\n📋 업데이트된 notifications 테이블 구조:');
      const [updatedDescribeResult] = await connection.execute('DESCRIBE notifications');
      updatedDescribeResult.forEach(row => {
        console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
      });
    } else {
      console.log('\n✅ 모든 필요한 컬럼이 존재합니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 데이터베이스 연결 종료');
    }
  }
}

checkNotificationsTable();
