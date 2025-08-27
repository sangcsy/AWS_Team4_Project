const mysql = require('mysql2/promise');

async function testDatabase() {
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

    // posts 테이블 구조 확인
    console.log('\n📋 posts 테이블 구조:');
    const [describeResult] = await connection.execute('DESCRIBE posts');
    describeResult.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // category 컬럼이 있는지 확인
    const hasCategory = describeResult.some(row => row.Field === 'category');
    
    if (!hasCategory) {
      console.log('\n🔧 category 컬럼 추가 중...');
      
      // category 컬럼 추가
      await connection.execute('ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT "자유"');
      console.log('✅ category 컬럼 추가 완료');
      
      // 기존 게시글들의 category를 '자유'로 설정
      await connection.execute('UPDATE posts SET category = "자유" WHERE category IS NULL');
      console.log('✅ 기존 게시글들의 category 설정 완료');
      
      // 테이블 구조 다시 확인
      console.log('\n📋 업데이트된 posts 테이블 구조:');
      const [updatedDescribeResult] = await connection.execute('DESCRIBE posts');
      updatedDescribeResult.forEach(row => {
        console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
      });
    } else {
      console.log('\n✅ category 컬럼이 이미 존재합니다');
    }

    // 샘플 게시글 데이터 확인
    console.log('\n📊 샘플 게시글 데이터:');
    const [posts] = await connection.execute('SELECT id, title, category, created_at FROM posts LIMIT 5');
    posts.forEach(post => {
      console.log(`  - ${post.id}: "${post.title}" (카테고리: ${post.category || 'NULL'}) - ${post.created_at}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 데이터베이스 연결 종료');
    }
  }
}

testDatabase();
