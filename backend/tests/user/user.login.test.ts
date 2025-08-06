import request from 'supertest';
// TODO: 실제 app import 경로는 구현 후 수정
import app from '../../src/main';

describe('로그인', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@tempus.com', password: 'StrongPass123!', nickname: 'loginuser' });
  });

  it('정상적으로 로그인된다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@tempus.com', password: 'StrongPass123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('잘못된 비밀번호는 로그인 불가', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@tempus.com', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });
});