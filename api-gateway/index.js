const express = require("express");
const proxy = require("express-http-proxy");
const app = express();
const PORT = 9001;

const INVENTORY_SERVICE =
  process.env.INVENTORY_SERVICE_URL || "http://localhost:3000";
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || "http://localhost:3001";
const PAYMENT_SERVICE =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3002";

console.log("API Gateway configurée avec les services :");
console.log(` - /inventory -> ${INVENTORY_SERVICE}`);
console.log(` - /orders    -> ${ORDER_SERVICE}`);
console.log(` - /payments  -> ${PAYMENT_SERVICE}`);

app.use("/inventory", proxy(INVENTORY_SERVICE));
app.use("/orders", proxy(ORDER_SERVICE));
app.use("/payments", proxy(PAYMENT_SERVICE));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
