const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');

let token, userId;

beforeAll(async () => {
  const user = await User.create({
    name: 'API User',
    email: `apiuser${Date.now()}@example.com`,
    password: 'strongpassword'
  });
  userId = user._id;

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'strongpassword' });

  token = login.body.token;
});

afterAll(async () => {
  if (userId) await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Users API', () => {
  test('GET /users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /users/:id', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', userId.toString());
  });
});
