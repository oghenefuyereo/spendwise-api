const mongoose = require('mongoose');

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spendwise_test';
  
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test database');
  } catch (err) {
    console.error('Error connecting to test database:', err);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    // Drop the database after tests to ensure a clean state
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database disconnected and dropped');
  } catch (err) {
    console.error('Error during database teardown:', err);
  }
});
