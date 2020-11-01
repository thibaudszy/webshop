const express = require("express");
const bcrypt = require("bcrypt");
const authMiddleware = require("../auth/middleware");
const User = require("../models/").user;
const Order = require("../models").order;
const { Router } = express;

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    //const limit = Math.min(req.query.limit  2, 15);
    //const offset = req.query.offset  0;
    // User.findAndCountAll({ limit, offset })
    //   .then((result) => res.send({ images: result.rows, total: result.count }))
    //   .catch((error) => next(error));
    const users = await User.findAll();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get("/:userId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (req.user.id != userId) {
      res.status(401).send(`You are not logged in as user ${userId}`);
      return;
    }
    const user = await User.findByPk(userId);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      address,
      email,
      phone,
      password,
      isAdmin,
    } = req.body;
    console.log(
      "request",
      firstName,
      lastName,
      address,
      email,
      phone,
      password,
      isAdmin
    );
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !address ||
      !phone ||
      !isAdmin
    ) {
      res.status(400).send("missing parameters");
      return;
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      address,
      phone,
      email,
      password: hashedPassword,
      isAdmin,
    });

    const { password: p, ...restOfUserInfo } = newUser.dataValues;
    res.json(restOfUserInfo);
  } catch (e) {
    next(e);
  }
});
module.exports = router;

router.get("/:userId/orders", async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const orders = await User.findByPk(userId, { include: [Order] });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});
