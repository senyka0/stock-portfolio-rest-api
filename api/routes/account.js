require("dotenv").config({ path: "../../.env" });
const router = require("express").Router();
const User = require("../models/User");

router.post("/", (req, res) => {
  User.find({ userName: req.body.userName }).then((result) => {
    if (!result.length) {
      const user = new User({ userName: req.body.userName, password: req.body.password, portfolio: [...req.body.portfolio] });
      user
        .save()
        .then((result) => res.status(201).json({ result: "Successfully created" }))
        .catch((err) => res.status(500).json({ result: err }));
    } else {
      res.status(409).json({ result: "Username already exists" });
    }
  });
});
router.patch("/", (req, res) => {
  User.find({ userName: req.body.newUserName }).then((result) => {
    if (!result.length) {
      User.updateOne({ userName: req.body.userName, password: req.body.password }, { userName: req.body.newUserName, password: req.body.newPassword })
        .then((result) => {
          if (result.modifiedCount) {
            res.status(204).json({ result: "Updated successfully" });
          } else {
            res.status(400).json({ result: "No such user exists" });
          }
        })
        .catch((err) => res.status(500).json({ result: err }));
    } else {
      res.status(409).json({ result: "Username already exists" });
    }
  });
});
router.delete("/", (req, res) => {
  User.deleteOne({ userName: req.body.userName, password: req.body.password })
    .then((result) => {
      if (result.deletedCount) {
        res.status(202).json({ result: "Deleted" });
      } else {
        res.status(400).json({ result: "No such user exists" });
      }
    })
    .catch((err) => res.status(500).json({ result: err }));
});
module.exports = router;
