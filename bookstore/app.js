const express = require("express");
const path = require("path");
const booksRouter = require("./routes/books");
const ordersRouter = require("./routes/order");
const paymentsRouter = require("./routes/payment");

const app = express();
const PORT = 4000;
const HOST = "0.0.0.0";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/books", booksRouter);
app.use("/orders", ordersRouter);
app.use("/payments", paymentsRouter);

app.get("/", (req, res) => {
  res.redirect("/books");
});

app.listen(PORT, HOST, () => {
  console.log(`🌐 Application Express connectée !`);
  console.log(`👉 Accède au site ici : http://localhost:${PORT}`);
});
