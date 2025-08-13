const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Passport configuration
require("./config/passport");

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // restrict in production if needed
  })
);

// HTTP request logging
app.use(morgan("dev"));

// Body parser with size limit
app.use(express.json({ limit: "10mb" }));

// Initialize Passport
app.use(passport.initialize());

// Serve Swagger only in non-production environments
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/goals", require("./routes/goals"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Spendwise API is running..." });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
