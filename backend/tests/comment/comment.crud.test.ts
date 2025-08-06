import request from 'supertest';
import app from '../../src/main';

describe('댓글 CRUD 및 온도 변화', () => {
  let token: string;
  let postId: string;
  let commentId: string;
  beforeAll(async () => {
    // 회원가입 및 로그인
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'comment@tempus.com', password: 'StrongPass123!', nickname: 'commentuser' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'comment@tempus.com', password: 'StrongPass123!' });
    token = res.body.token;
    // 글 작성
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '댓글용 글', content: '댓글 테스트' });
    postId = postRes.body.id;
  });

  it('댓글 작성 시 온도가 상승한다', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '댓글입니다.' });
    expect(res.status).toBe(201);
    commentId = res.body.id;
    // 온도 확인
    const tempRes = await request(app)
      .get('/api/temperature')
      .set('Authorization', `Bearer ${token}`);
    expect(tempRes.body.temperature).toBeGreaterThan(36.5);
  });

  it('댓글 삭제', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});