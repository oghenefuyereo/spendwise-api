const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app

describe('Auth routes', () => {
  it('POST /auth/register - should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('POST /auth/login - should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  // Google OAuth callback tests would normally require mocking or a real token, so skipping here
});
