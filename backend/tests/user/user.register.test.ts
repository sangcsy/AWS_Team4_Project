import request from 'supertest';
// TODO: 실제 app import 경로는 구현 후 수정
import app from '../../src/main';

describe('회원가입', () => {
  it('정상적으로 회원가입이 된다', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test1@tempus.com', password: 'StrongPass123!', nickname: 'tempus1' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.nickname).toBe('tempus1');
  });

  it('중복 닉네임은 가입 불가', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test2@tempus.com', password: 'StrongPass123!', nickname: 'tempus2' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test3@tempus.com', password: 'StrongPass123!', nickname: 'tempus2' });
    expect(res.status).toBe(409);
  });

  it('약한 비밀번호는 가입 불가', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test4@tempus.com', password: '123', nickname: 'tempus4' });
    expect(res.status).toBe(400);
  });
});