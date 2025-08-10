const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

// Middleware setup

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"  // Set in .env, e.g. http://localhost:3000
}));

app.use(morgan("dev"));

app.use(express.json());

// Swagger UI at /api-docs (or change to /api/api-docs if you prefer)
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
