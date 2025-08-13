const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Category = require('../models/category');
const User = require('../models/user');
const Transaction = require('../models/transaction');

let token;
let testCategoryId;
let testUserEmail = `testuser${Date.now()}@example.com`;

beforeAll(async () => {
  try {
    // Connect to test database if not already connected
    const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/spendwise_test';
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    }

    // Clear relevant collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Transaction.deleteMany({});

    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testUserEmail, password: 'password123' });

    // Login test user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserEmail, password: 'password123' });

    token = loginRes.body.token;
    if (!token) throw new Error('Failed to get JWT token for testing');

    // Create test category
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Category', type: 'expense' });

    if (categoryRes.statusCode !== 201 || !categoryRes.body._id) {
      throw new Error('Failed to create test category');
    }
    testCategoryId = categoryRes.body._id;

  } catch (err) {
    console.error('Setup error:', err);
    throw err;
  }
});

afterAll(async () => {
  try {
    // Clean up transactions, category, and user
    await Transaction.deleteMany({});
    if (testCategoryId) await Category.findByIdAndDelete(testCategoryId);
    const user = await User.findOne({ email: testUserEmail });
    if (user) await User.findByIdAndDelete(user._id);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Teardown error:', err);
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
      category: testCategoryId,
      description: 'Grocery shopping',
      date: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(newTransaction);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('amount', newTransaction.amount);
    expect(res.body).toHaveProperty('type', newTransaction.type);
    expect(res.body).toHaveProperty('description', newTransaction.description);

    // Category check: works whether populated or just ID
    const categoryIdInResponse = res.body.category?._id || res.body.category;
    expect(categoryIdInResponse.toString()).toBe(testCategoryId);
  });
});
