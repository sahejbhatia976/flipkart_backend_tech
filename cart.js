const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const cart = mongoose.model(
  "cart",
  new mongoose.Schema({
    userID: String,
    items: [
      {
        productID: String,
        quantity: Number,
      },
    ],
  })
);

router.post("/cart/add", async (req, res) => {
  try {
    const { productID, quantity = 1, user } = req.body;
    if (!productID || !user) {
      return res
        .status(400)
        .json({ message: "Productid and user is required" });
    }
  } catch (err) {}
});
