const request = require('supertest');
const app = require('../app');
let token;

beforeAll(async () => {
  // Login to get JWT token
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });

  token = res.body.token;
  if (!token) {
    throw new Error('Failed to get JWT token for testing');
  }
});

describe('Users routes', () => {
  it('GET /users - should return a list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
    }
  });

  it('GET /users/:id - should return a single user by ID', async () => {
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    const userId = usersRes.body[0]._id;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', userId);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('email');
  });

  it('PUT /users/:id - should update a user by ID', async () => {
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    const userId = usersRes.body[0]._id;

    const updatedData = { name: 'Updated Test User' };

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', updatedData.name);
  });

  it('DELETE /users/:id - should delete a user by ID', async () => {
    const newUserRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Temp User', email: 'tempuser@example.com', password: 'password123' });

    const userId = newUserRes.body._id;

    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
