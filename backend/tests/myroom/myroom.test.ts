import request from 'supertest';
import app from '../../src/main';

describe('마이룸/프로필/팔로우', () => {
  let token: string;
  let otherToken: string;
  beforeAll(async () => {
    // 내 계정
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'myroom@tempus.com', password: 'StrongPass123!', nickname: 'myroomuser' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'myroom@tempus.com', password: 'StrongPass123!' });
    token = res.body.token;
    // 팔로우 대상 계정
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'other@tempus.com', password: 'StrongPass123!', nickname: 'otheruser' });
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'other@tempus.com', password: 'StrongPass123!' });
    otherToken = res2.body.token;
  });

  it('마이룸(프로필) 조회', async () => {
    const res = await request(app)
      .get('/api/myroom/myroomuser')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.nickname).toBe('myroomuser');
    expect(res.body).toHaveProperty('temperature');
    expect(res.body).toHaveProperty('items');
  });

  it('팔로우/언팔로우', async () => {
    // 팔로우
    const followRes = await request(app)
      .post('/api/follow/otheruser')
      .set('Authorization', `Bearer ${token}`);
    expect(followRes.status).toBe(200);
    // 언팔로우
    const unfollowRes = await request(app)
      .delete('/api/follow/otheruser')
      .set('Authorization', `Bearer ${token}`);
    expect(unfollowRes.status).toBe(200);
  });

  it('내 피드에서 팔로잉 유저의 활동 확인', async () => {
    // 팔로우
    await request(app)
      .post('/api/follow/otheruser')
      .set('Authorization', `Bearer ${token}`);
    // otheruser가 글 작성
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: '팔로우 글', content: '팔로우 피드 테스트' });
    // 내 피드 조회
    const feedRes = await request(app)
      .get('/api/feed')
      .set('Authorization', `Bearer ${token}`);
    expect(feedRes.status).toBe(200);
    expect(Array.isArray(feedRes.body)).toBe(true);
    expect(feedRes.body.some((a: any) => a.title === '팔로우 글')).toBe(true);
  });
});