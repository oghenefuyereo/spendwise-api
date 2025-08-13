const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

let token;
let testUserId;
const testUserEmail = `testuser${Date.now()}@example.com`;

beforeAll(async () => {
  // Register a test user
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: testUserEmail, password: 'password123' });

  // Login to get token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUserEmail, password: 'password123' });

  if (loginRes.statusCode !== 200 || !loginRes.body.token) {
    throw new Error('Failed to login test user');
  }

  token = loginRes.body.token;

  // Fetch user ID from DB (more reliable)
  const user = await User.findOne({ email: testUserEmail });
  if (!user) throw new Error('Test user not found in DB');
  testUserId = user._id.toString();
});

afterAll(async () => {
  // Clean up test user
  await User.findByIdAndDelete(testUserId);
});

describe('Users routes', () => {
  it('GET /users - should return list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /users/:id - should return a single user', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testUserEmail);
  });

  it('PUT /users/:id - should update a user', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated User' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated User');
  });

  it('DELETE /users/:id - should delete a user', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
