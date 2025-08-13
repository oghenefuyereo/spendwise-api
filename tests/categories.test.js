const request = require('supertest');
const app = require('../app');

let token;
let testUserEmail = `testuser${Date.now()}@example.com`; // unique email for test
let categoryId;

// --- Register and login test user before all category tests ---
beforeAll(async () => {
  // Register test user
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: testUserEmail, password: 'password123' });

  if (![201, 400].includes(registerRes.statusCode)) {
    throw new Error(`Unexpected status code during registration: ${registerRes.statusCode}`);
  }

  // Login test user
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUserEmail, password: 'password123' });

  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body).toHaveProperty('token');
  token = loginRes.body.token;
});

describe('Categories routes', () => {
  it('POST /categories - should create a new category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Category', type: 'income' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Test Category');
    expect(res.body).toHaveProperty('type', 'income');

    categoryId = res.body._id; // store for further tests
  });

  it('GET /categories - should return all categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(cat => cat._id === categoryId)).toBe(true);
  });

  it('GET /categories/:id - should return a single category by ID', async () => {
    const res = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', categoryId);
  });

  it('PUT /categories/:id - should update a category', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Category', type: 'expense' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Category');
    expect(res.body).toHaveProperty('type', 'expense');
  });

  it('DELETE /categories/:id - should delete a category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Category deleted successfully');
  });
});
