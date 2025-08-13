const request = require('supertest');
const app = require('../app');
let token;

beforeAll(async () => {
  // Login first to get JWT token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });

  token = res.body.token;
  if (!token) {
    throw new Error('Failed to get JWT token for testing');
  }
});

describe('Transactions routes', () => {
  it('GET /transactions - should return all transactions for logged-in user', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /transactions - should create a new transaction', async () => {
    const newTransaction = {
      amount: 100.5,
      type: 'expense',
      category: '64a3f4b5c1234abcd56789ef',
      description: 'Grocery shopping',
      date: new Date().toISOString()
    };

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(newTransaction);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('amount', newTransaction.amount);
    expect(res.body).toHaveProperty('type', newTransaction.type);
  });
});
