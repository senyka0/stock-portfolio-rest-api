require("dotenv").config({ path: "../../.env" });
const router = require("express").Router();
const fetch = require("node-fetch");
const User = require("../models/User");

router.get("/", (req, res) => {
  User.find({ userName: req.body.userName, password: req.body.password }).then((result) => {
    if (result.length) {
      fetch(`https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/${result[0].portfolio.map((item) => item.symbol).join(",")}`, {
        headers: {
          "X-RapidAPI-Key": process.env.XRapidAPIKey,
          "X-RapidAPI-Host": process.env.XRapidAPIHost,
        },
      })
        .then((data) => data.json())
        .then((data) => {
          const initialBalance = result[0].portfolio.reduce((total, item) => total + item.quantity * item.buyPrice, 0);
          const currentBalance = data.reduce((total, item, index) => total + item.bid * result[0].portfolio[index].quantity, 0);
          const allTimeProfit = ((currentBalance - initialBalance) / initialBalance) * 100;
          const positions = result[0].portfolio.map((item) => ({ symbol: item.symbol, buyPrice: item.buyPrice, quantity: item.quantity, price: data.find((elem) => elem.symbol === item.symbol).bid }));
          res.status(200).json({ result: { currentBalance, allTimeProfit, positions } });
        })
        .catch((err) => res.status(500).send({ result: err }));
    } else {
      res.status(400).json({ result: "No such user exists" });
    }
  });
});
router.patch("/", (req, res) => {
  User.updateOne({ userName: req.body.userName, password: req.body.password }, { $push: { portfolio: req.body.newStock } })
    .then((result) => {
      if (result.modifiedCount) {
        res.status(204).json({ result: "Added successfully" });
      } else {
        res.status(400).json({ result: "No such user exists" });
      }
    })
    .catch((err) => res.status(500).json({ result: err }));
});
router.delete("/", (req, res) => {
  User.updateOne({ userName: req.body.userName, password: req.body.password }, { $pull: { portfolio: { symbol: req.body.delSymbol } } })
    .then((result) => {
      if (result.modifiedCount) {
        res.status(202).json({ result: "Deleted" });
      } else {
        res.status(400).json({ result: "You don't have this stock" });
      }
    })
    .catch((err) => res.status(500).json({ result: err }));
});
module.exports = router;
