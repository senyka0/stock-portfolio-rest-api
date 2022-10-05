require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const account = require("./routes/account");
const portfolio = require("./routes/portfolio");

const app = express();
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_CLIENT);

app.use(bodyParser.json());
app.use("/account", account);
app.use("/portfolio", portfolio);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
