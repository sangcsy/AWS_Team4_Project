import request from 'supertest';
import app from '../../src/main';

describe('게시글 CRUD 및 온도 변화', () => {
  let token: string;
  let postId: string;
  beforeAll(async () => {
    // 회원가입 및 로그인
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'post@tempus.com', password: 'StrongPass123!', nickname: 'postuser' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'post@tempus.com', password: 'StrongPass123!' });
    token = res.body.token;
  });

  it('글 작성 시 온도가 상승한다', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '첫 글', content: '내용입니다.' });
    expect(res.status).toBe(201);
    postId = res.body.id;
    // 온도 확인
    const tempRes = await request(app)
      .get('/api/temperature')
      .set('Authorization', `Bearer ${token}`);
    expect(tempRes.body.temperature).toBeGreaterThan(36.5);
  });

  it('글 상세 조회', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('첫 글');
  });

  it('글 수정', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '수정된 글', content: '수정된 내용' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정된 글');
  });

  it('글 삭제', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});