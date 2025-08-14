const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Transaction = require('../models/transaction');

let token, transactionId, userId;

beforeAll(async () => {
  // create test user
  const user = await User.create({
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'strongpassword'
  });
  userId = user._id;

  // login user
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'strongpassword' });

  token = login.body.token;

  // create transaction with all required fields
  const transactionRes = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      amount: 100,
      type: 'expense',
      category: 'Misc',
      user: userId // required field
    });

  transactionId = transactionRes.body._id;
});

afterAll(async () => {
  if (transactionId) await Transaction.deleteMany({ _id: transactionId });
  if (userId) await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Transactions API', () => {
  test('GET /transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /transactions/:id', async () => {
    const res = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('amount', 100);
  });
});
