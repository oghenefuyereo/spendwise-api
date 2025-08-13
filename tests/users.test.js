const request = require('supertest');
const app = require('../app');
let token;

beforeAll(async () => {
  // Login to get token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });
  token = res.body.token;
});

describe('Users routes', () => {
  it('GET /users - should return list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /users/:id - should return user by ID', async () => {
    // Get list of users first to grab an ID
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    const userId = usersRes.body[0]._id;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', userId);
  });
});
