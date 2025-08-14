const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Goal = require('../models/goal');

let token, goalId, userId;

beforeAll(async () => {
  const user = await User.create({
    name: 'Goal User',
    email: `goaluser${Date.now()}@example.com`,
    password: 'strongpassword'
  });
  userId = user._id;

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'strongpassword' });

  token = login.body.token;

  const goalRes = await request(app)
    .post('/api/goals')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Goal',
      targetAmount: 1000,
      currentAmount: 0,
      user: userId
    });

  goalId = goalRes.body._id;
});

afterAll(async () => {
  if (goalId) await Goal.deleteMany({ _id: goalId });
  if (userId) await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Goals API', () => {
  test('GET /goals', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /goals/:id', async () => {
    const res = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('targetAmount', 1000);
  });
});
