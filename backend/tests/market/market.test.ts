import request from 'supertest';
import app from '../../src/main';

describe('마켓/온도 기반 신뢰도', () => {
  let token: string;
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'market@tempus.com', password: 'StrongPass123!', nickname: 'marketuser' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'market@tempus.com', password: 'StrongPass123!' });
    token = res.body.token;
  });

  let itemId: string;
  it('마켓 등록', async () => {
    const res = await request(app)
      .post('/api/market')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '중고 노트북', desc: '상태 좋음', price: 500000 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    itemId = res.body.id;
  });

  it('마켓 목록 조회', async () => {
    const res = await request(app)
      .get('/api/market')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((i: any) => i.title === '중고 노트북')).toBe(true);
  });

  it('마켓 상세 조회 시 온도 기반 신뢰도 표시', async () => {
    const res = await request(app)
      .get(`/api/market/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('trust');
    expect(typeof res.body.trust).toBe('number');
  });
});