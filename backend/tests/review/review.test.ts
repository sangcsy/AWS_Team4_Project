import request from 'supertest';
import app from '../../src/main';

describe('마켓 후기', () => {
  let token: string;
  let itemId: string;
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'review@tempus.com', password: 'StrongPass123!', nickname: 'reviewuser' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'review@tempus.com', password: 'StrongPass123!' });
    token = res.body.token;
    // 마켓 등록
    const itemRes = await request(app)
      .post('/api/market')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '책', desc: '새책', price: 10000 });
    itemId = itemRes.body.id;
  });

  let reviewId: string;
  it('후기 등록', async () => {
    const res = await request(app)
      .post(`/api/market/${itemId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: '좋아요!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    reviewId = res.body.id;
  });

  it('후기 목록 조회', async () => {
    const res = await request(app)
      .get(`/api/market/${itemId}/review`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((r: any) => r.comment === '좋아요!')).toBe(true);
  });

  it('후기 평균 확인', async () => {
    const res = await request(app)
      .get(`/api/market/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.reviewAvg).toBe('number');
  });
});