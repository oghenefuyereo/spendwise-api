const request = require("supertest");
const app = require("../app");
const Goal = require("../models/goal");
const User = require("../models/user");

let token;
let goalId;
let userId;
let testUserEmail = `goaluser${Date.now()}@example.com`;

beforeAll(async () => {
  const userRes = await request(app).post("/api/auth/register").send({
    name: "Goal User",
    email: testUserEmail,
    password: "Test1234!",
  });

  token = userRes.body.token;
  const user = await User.findOne({ email: testUserEmail });
  userId = user._id;

  const goalRes = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${token}`)
    .send({
      targetAmount: 1000,
      currentProgress: 0,
      deadline: "2025-12-31",
    });

  goalId = goalRes.body._id;
});

afterAll(async () => {
  await Goal.deleteOne({ _id: goalId });
  await User.deleteOne({ _id: userId });
});

describe("Goals API", () => {
  test("GET /goals - should return all goals", async () => {
    const res = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /goals/:id - should return a specific goal", async () => {
    const res = await request(app)
      .get(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("targetAmount", 1000);
  });

  // Data validation tests
  test("POST /goals - should fail with invalid data", async () => {
    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetAmount: "", deadline: "" }); // Invalid
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("PUT /goals/:id - should fail with invalid data", async () => {
    const res = await request(app)
      .put(`/api/goals/${goalId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ targetAmount: "", deadline: "" }); // Invalid
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});
