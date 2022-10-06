require("dotenv").config({ path: "../../.env" });
const router = require("express").Router();
const fetch = require("node-fetch");
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  if (!req.body.userName || !req.body.password) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName }).then((result) => {
    if (!result) return res.status(404).json({ result: "No such user exists" });
    bcrypt.compare(req.body.password, result.password, (err, hashResult) => {
      if (err) return res.status(500).json({ result: err });
      if (!hashResult) return res.status(403).json({ result: "Wrong password" });
      fetch(`https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${result.portfolio.map((item) => item.symbol).join(",")}`, {
        headers: {
          "X-RapidAPI-Key": process.env.XRapidAPIKey,
          "X-RapidAPI-Host": process.env.XRapidAPIHost,
        },
      })
        .then((data) => data.json())
        .then((data) => {
          const initialBalance = result.portfolio.reduce((total, item) => total + item.quantity * item.buyPrice, 0);
          const currentBalance = data.reduce((total, item, index) => total + item.bid * result.portfolio[index].quantity, 0);
          const allTimeProfit = ((currentBalance - initialBalance) / initialBalance) * 100;
          const positions = result.portfolio.map((item) => ({ symbol: item.symbol, buyPrice: item.buyPrice, quantity: item.quantity, price: data.find((elem) => elem.symbol === item.symbol).bid }));
          res.status(200).json({ result: { currentBalance, allTimeProfit, positions } });
        })
        .catch((err) => res.status(500).send({ result: err }));
    });
  });
});
router.patch("/", (req, res) => {
  if (!req.body.newStock.symbol || !req.body.newStock.buyPrice || !req.body.newStock.quantity) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName }).then((result) => {
    if (!result) return res.status(404).json({ result: "No such user exists" });
    bcrypt.compare(req.body.password, result.password, (err, hashResult) => {
      if (err) return res.status(500).json({ result: err });
      if (!hashResult) return res.status(403).json({ result: "Wrong password" });
      User.updateOne({ userName: req.body.userName }, { $push: { portfolio: req.body.newStock } })
        .then((result2) => {
          if (!result2.modifiedCount) return res.status(500).json({ result: "Server error" });
          res.status(201).json({ result: "Added successfully" });
        })
        .catch((err) => res.status(500).json({ result: err }));
    });
  });
});
router.delete("/", (req, res) => {
  if (!req.body.delSymbol) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName }).then((result) => {
    if (!result) return res.status(404).json({ result: "No such user exists" });
    bcrypt.compare(req.body.password, result.password, (err, hashResult) => {
      if (err) return res.status(500).json({ result: err });
      if (!hashResult) return res.status(403).json({ result: "Wrong password" });
      if (!result.portfolio.some((item) => item.symbol === req.body.delSymbol)) return res.status(400).json({ result: "You don't have this stock" });
      User.updateOne({ userName: req.body.userName }, { $pull: { portfolio: { symbol: req.body.delSymbol } } })
        .then((result2) => {
          if (!result2.modifiedCount) return res.status(500).json({ result: "Server error" });
          res.status(202).json({ result: "Deleted" });
        })
        .catch((err) => res.status(500).json({ result: err }));
    });
  });
});
module.exports = router;
