const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Adjust path to your Express app

// Increase Jest timeout for async DB operations
jest.setTimeout(20000);

const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/spendwise_test';

// --- Connect to test DB before all tests ---
beforeAll(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    // Clear collections
    const collections = Object.keys(mongoose.connection.collections);
    for (const name of collections) {
      await mongoose.connection.collections[name].deleteMany({});
    }

    console.log('✅ Connected to test database and cleared collections');
  } catch (err) {
    console.error('❌ Error connecting to test database:', err.message);
    process.exit(1);
  }
});

// --- Disconnect and clear DB after all tests ---
afterAll(async () => {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const name of collections) {
      await mongoose.connection.collections[name].deleteMany({});
    }

    await mongoose.connection.close();
    console.log('🛑 Test database cleared and disconnected');
  } catch (err) {
    console.error('❌ Error during database teardown:', err.message);
  }
});

describe('Auth Routes', () => {
  let token;
  const randomEmail = `testuser${Date.now()}@example.com`;

  it('POST /auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: randomEmail, password: 'password123' });

    // Expect status 201 Created
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body.user).toHaveProperty('email', randomEmail);
  });

  it('POST /auth/login - should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: randomEmail, password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', randomEmail);

    token = res.body.token; // Save token for subsequent requests
  });

  it('GET /auth/me - should get logged-in user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', randomEmail);
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  it('PUT /auth/me - should update user name', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });

  it('DELETE /auth/me - should delete user account', async () => {
    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User account deleted successfully');
  });
});
