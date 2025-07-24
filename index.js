const express = require("express");
const http = require("http");
const cors = require("cors");
const compression = require("compression");
const { connectDb, sequelize } = require("./config/db.js");
const morgan = require("morgan");

const categoryRoute = require("./routes/categoryRoute");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const customerRoute = require("./routes/customerRoute");
const productRoute = require("./routes/productRoute");
const supplierRoute = require("./routes/supplierRoute");
const purchaseOrderRoute = require("./routes/purchaseOrderRoute");
const discountRoute = require("./routes/discountRoute.js");
const saleRoute = require("./routes/saleRoute.js");
const paymentRoute = require("./routes/paymentRoute.js");
const reportRoute = require("./routes/reportRoute.js");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors());

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Routes
app.get("/", (req, res) => {
  res.send("POS API running...");
});
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/customers", customerRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/purchase-orders", purchaseOrderRoute);
app.use("/api/discounts", discountRoute);
app.use("/api/sales", saleRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reports", reportRoute);
// PORT
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    // await sequelize.sync();
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message || "An error occurred",
  });
});
