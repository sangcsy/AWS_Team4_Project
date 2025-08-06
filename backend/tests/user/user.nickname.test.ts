import request from 'supertest';
// TODO: 실제 app import 경로는 구현 후 수정
import app from '../../src/main';

describe('닉네임 중복 확인', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'nick@tempus.com', password: 'StrongPass123!', nickname: 'nickuser' });
  });

  it('이미 존재하는 닉네임은 false 반환', async () => {
    const res = await request(app)
      .get('/api/auth/check-nickname')
      .query({ nickname: 'nickuser' });
    expect(res.body.available).toBe(false);
  });

  it('없는 닉네임은 true 반환', async () => {
    const res = await request(app)
      .get('/api/auth/check-nickname')
      .query({ nickname: 'uniquenick' });
    expect(res.body.available).toBe(true);
  });
});