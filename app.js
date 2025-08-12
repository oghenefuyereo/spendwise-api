const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables from .env file
dotenv.config();

// Passport configuration (ensure path is correct)
require("./config/passport");

const app = express();

// Apply security-related HTTP headers
app.use(helmet());

// Enable CORS - allow origin from env variable or all origins by default
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// HTTP request logging middleware
app.use(morgan("dev"));

// Parse JSON bodies
app.use(express.json());

// Initialize Passport for authentication
app.use(passport.initialize());

// Serve API docs using Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API route handlers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));  
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/goals", require("./routes/goals"));

// Root route to confirm API is running
app.get("/", (req, res) => {
  res.json({ message: "Spendwise API is running..." });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
