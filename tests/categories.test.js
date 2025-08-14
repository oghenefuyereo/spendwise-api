const request = require("supertest");
const app = require("../app");
const Category = require("../models/category");
const User = require("../models/user");

let token;
let categoryId;
let userId;
let testUserEmail = `catuser${Date.now()}@example.com`;

beforeAll(async () => {
  const userRes = await request(app).post("/api/auth/register").send({
    name: "Category User",
    email: testUserEmail,
    password: "Test1234!",
  });

  token = userRes.body.token;
  const user = await User.findOne({ email: testUserEmail });
  userId = user._id;

  const catRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test Category", type: "expense" });
  
  categoryId = catRes.body._id;
});

afterAll(async () => {
  await Category.deleteOne({ _id: categoryId });
  await User.deleteOne({ _id: userId });
});

describe("Categories API", () => {
  test("GET /categories - should return all categories", async () => {
    const res = await request(app).get("/api/categories").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /categories/:id - should return a specific category", async () => {
    const res = await request(app).get(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Test Category");
  });
});
