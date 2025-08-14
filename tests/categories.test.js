const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Category = require('../models/category');

let token, categoryId, userId;

beforeAll(async () => {
  const user = await User.create({
    name: 'Cat User',
    email: `catuser${Date.now()}@example.com`,
    password: 'strongpassword'
  });
  userId = user._id;

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'strongpassword' });

  token = login.body.token;

  const categoryRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Category',
      type: 'expense'
    });

  categoryId = categoryRes.body._id;
});

afterAll(async () => {
  if (categoryId) await Category.deleteMany({ _id: categoryId });
  if (userId) await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Categories API', () => {
  test('GET /categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /categories/:id', async () => {
    const res = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Category');
  });
});
