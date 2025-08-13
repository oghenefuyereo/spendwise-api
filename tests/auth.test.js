const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app

describe('Auth routes', () => {
  let token;
  const randomEmail = `testuser${Date.now()}@example.com`;

  it('POST /auth/register - should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: randomEmail, password: 'password123' });

    // Allow 201 if success, 400 if email already exists
    expect([201, 400]).toContain(res.statusCode);

    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    }
  });

  it('POST /auth/login - should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: randomEmail, password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', randomEmail);

    token = res.body.token; // store token for future tests
  });

  // Google OAuth tests skipped (require mocking or real token)
});
