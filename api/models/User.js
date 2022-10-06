const mongoose = require("mongoose");

const User = mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  portfolio: [{ symbol: { type: String, required: true }, buyPrice: { type: Number, required: true }, quantity: { type: Number, required: true } }],
});
module.exports = mongoose.model("User", User);
