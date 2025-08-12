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

// Passport config (adjust path if needed)
require("./config/passport");

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS, allow origin from env or all origins (*)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

// HTTP request logger
app.use(morgan("dev"));

// Body parser middleware
app.use(express.json());

// Initialize Passport (for authentication)
app.use(passport.initialize());

// Serve Swagger UI docs at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API route handlers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));  // <--- Added this line
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/goals", require("./routes/goals"));

// Root endpoint - simple JSON message
app.get("/", (req, res) => {
  res.json({ message: "Spendwise API is running..." });
});

// Custom error handling middleware
app.use(errorHandler);

module.exports = app;
