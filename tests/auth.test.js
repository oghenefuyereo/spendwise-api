const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

let testUserEmail = `authuser${Date.now()}@example.com`;

afterAll(async () => {
  await User.deleteOne({ email: testUserEmail });
});

describe("Auth API", () => {
  test("POST /api/auth/register - should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Auth Test User",
      email: testUserEmail,
      password: "Test1234!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /api/auth/login - should login the existing test user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUserEmail,
      password: "Test1234!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
