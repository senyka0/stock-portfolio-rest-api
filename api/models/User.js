const mongoose = require("mongoose");

const User = mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  portfolio: [{ symbol: { type: String }, buyPrice: { type: Number }, quantity: { type: Number } }],
});
module.exports = mongoose.model("User", User);
