require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log("\nShutting down server...");
      server.close(async () => {
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
