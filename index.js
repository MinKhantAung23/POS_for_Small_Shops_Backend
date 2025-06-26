require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(express.json());
const bodyParser = require("body-parser");

const morgan = require("morgan");
const logger = require("./config/logger");

const {
  apiLimiter,
  authLimiter,
} = require("./middlewares/rateLimit.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/product.route");
const categoryRoutes = require("./routes/category.route");
const supplierRoutes = require("./routes/supplier.route");
const customerRoutes = require("./routes/customer.route");
const saleRoutes = require("./routes/sale.route");
const stockAdjustmentRoutes = require("./routes/stockAdjustment.route");
const reportRoutes = require("./routes/report.route");

// Middlewares
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("POS API is running...");
});

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(apiLimiter);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/stock-adjustments", stockAdjustmentRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  //  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", { reason, promise });
  process.exit(1);
});
