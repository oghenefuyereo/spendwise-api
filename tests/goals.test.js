const request = require('supertest');
const app = require('../app');

let token;
let testUserEmail = `testuser${Date.now()}@example.com`; // unique email for test
let goalId;

// --- Register and login test user before all goal tests ---
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

describe('Goals routes', () => {
  it('POST /goals - should create a new goal', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ targetAmount: 5000, currentProgress: 0, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('targetAmount', 5000);
    expect(res.body).toHaveProperty('currentProgress', 0);

    goalId = res.body._id; // store for further tests
  });

  it('GET /goals - should return all goals', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(goal => goal._id === goalId)).toBe(true);
  });

  it('GET /goals/:id - should return a single goal by ID', async () => {
    const res = await request(app)
      .get(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', goalId);
  });

  it('PUT /goals/:id - should update a goal', async () => {
    const res = await request(app)
      .put(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentProgress: 1000 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('currentProgress', 1000);
  });

  it('DELETE /goals/:id - should delete a goal', async () => {
    const res = await request(app)
      .delete(`/api/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Goal deleted successfully');
  });
});
