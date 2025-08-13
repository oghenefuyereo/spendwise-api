const request = require('supertest');
const app = require('../app');

let token;
let testUserEmail = `testuser${Date.now()}@example.com`; // unique email for test

beforeAll(async () => {
  // Register test user
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: testUserEmail, password: 'password123' })
    .expect(res => {
      if (![201, 400].includes(res.statusCode)) {
        throw new Error(`Unexpected status code: ${res.statusCode}`);
      }
    });

  // Login test user
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUserEmail, password: 'password123' });

  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body).toHaveProperty('token');
  token = loginRes.body.token;
});

describe('Categories routes', () => {
  it('GET /categories - should return all categories with proper fields', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      res.body.forEach(category => {
        expect(category).toHaveProperty('_id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('type');
      });
    }
  });
});
