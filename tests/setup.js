const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/spendwise_test";

beforeAll(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    console.log("Connected to test database");

    // Clear all collections before tests
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }
    console.log("Test database cleared");
  } catch (err) {
    console.error("Error connecting to test database:", err.message);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    // Clear all collections after tests
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }

    await mongoose.connection.close();
    console.log("Test database cleared and disconnected");
  } catch (err) {
    console.error("Error during database teardown:", err.message);
  }
});
