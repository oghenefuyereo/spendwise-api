const request = require("supertest");
const app = require("../app");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const Category = require("../models/category");

let token;
let transactionId;
let categoryId;
let userId;
let testUserEmail = `txnuser${Date.now()}@example.com`;

beforeAll(async () => {
  const userRes = await request(app).post("/api/auth/register").send({
    name: "Transaction User",
    email: testUserEmail,
    password: "Test1234!",
  });

  token = userRes.body.token;
  const user = await User.findOne({ email: testUserEmail });
  userId = user._id;

  const catRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Transaction Category", type: "expense" });

  categoryId = catRes.body._id;

  const txnRes = await request(app)
    .post("/api/transactions")
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 100, type: "expense", category: categoryId, user: userId });

  transactionId = txnRes.body._id;
});

afterAll(async () => {
  await Transaction.deleteOne({ _id: transactionId });
  await Category.deleteOne({ _id: categoryId });
  await User.deleteOne({ _id: userId });
});

describe("Transactions API", () => {
  test("GET /transactions - should return all transactions", async () => {
    const res = await request(app).get("/api/transactions").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /transactions/:id - should return a specific transaction", async () => {
    const res = await request(app).get(`/api/transactions/${transactionId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("amount", 100);
  });
});
