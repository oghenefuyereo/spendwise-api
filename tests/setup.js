const mongoose = require("mongoose");
require("dotenv").config();

// Use separate test database
const MONGO_URI = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/spendwise_test";

async function clearDatabase() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
}

beforeAll(async () => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // 10s timeout
      });
      console.log("Connected to test database");
    }
    await clearDatabase();
    console.log("Test database cleared");
  } catch (err) {
    console.error("Error connecting to test database:", err.message);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState) {
      await clearDatabase();
      await mongoose.connection.close();
      console.log("Test database cleared and disconnected");
    }
  } catch (err) {
    console.error("Error during database teardown:", err.message);
  }
});
