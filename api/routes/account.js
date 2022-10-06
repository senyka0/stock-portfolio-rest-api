require("dotenv").config({ path: "../../.env" });
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/", (req, res) => {
  if (!req.body.userName || !req.body.password) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName })
    .then((result) => {
      console.log(result);
      if (result) return res.status(409).json({ result: "Username already exists" });
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.status(500).json({ result: err });
        const user = new User({ userName: req.body.userName, password: hash, portfolio: [...req.body.portfolio] });
        user
          .save()
          .then((result) => res.status(201).json({ result: "Successfully created" }))
          .catch((err) => res.status(500).json({ result: err }));
      });
    })
    .catch((err) => res.status(500).send({ result: err }));
});
router.patch("/", (req, res) => {
  if (!req.body.userName || !req.body.password || !req.body.newUserName || !req.body.newPassword) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName })
    .then((result) => {
      if (!result) return res.status(404).json({ result: "No such user exists" });
      bcrypt.compare(req.body.password, result.password, (err, hashResult) => {
        if (err) return res.status(500).json({ result: err });
        if (!hashResult) return res.status(403).json({ result: "Wrong password" });
        User.findOne({ userName: req.body.newUserName }).then((elem) => {
          if (elem) return res.status(409).json({ result: "Username already exists" });
          bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
            if (err) return res.status(500).json({ result: err });
            User.updateOne({ userName: req.body.userName }, { userName: req.body.newUserName, password: hash })
              .then((result2) => {
                if (!result2.modifiedCount) return res.status(500).json({ result: "Server error" });
                res.status(201).json({ result: "Updated successfully" });
              })
              .catch((err) => res.status(500).json({ result: err }));
          });
        });
      });
    })
    .catch((err) => res.status(500).json({ result: err }));
});
router.delete("/", (req, res) => {
  if (!req.body.userName || !req.body.password) return res.status(403).json({ result: "Missing parameter" });
  User.findOne({ userName: req.body.userName })
    .then((result) => {
      if (!result) return res.status(404).json({ result: "No such user exists" });
      bcrypt.compare(req.body.password, result.password, (err, hashResult) => {
        if (err) return res.status(500).json({ result: err });
        if (!hashResult) return res.status(403).json({ result: "Wrong password" });
        User.deleteOne({ userName: req.body.userName })
          .then((result2) => {
            console.log(result2)
            if (!result2.deletedCount) return res.status(500).json({ result: "Server error" });
            res.status(202).json({ result: "Deleted" });
          })
          .catch((err) => res.status(500).json({ result: err }));
      });
    })
    .catch((err) => res.status(500).json({ result: err }));
});

module.exports = router;
