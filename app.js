const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Import your Passport config (make sure the path matches where your passport.js file is)
require("./config/passport");

const app = express();

// Middleware setups
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"  // e.g. http://localhost:3000
}));

app.use(morgan("dev"));

app.use(express.json());

// Initialize Passport middleware
app.use(passport.initialize());

// Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/goals", require("./routes/goals"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Spendwise API is running..." });
});

app.use(errorHandler);

module.exports = app;
