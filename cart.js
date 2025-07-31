const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Define Cart Schema & Model
const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema({
    userID: String,
    items: [
      {
        productID: String,
        quantity: Number,
      },
    ],
    status: { type: String, default: "active" },
    updatedAt: { type: Date, default: Date.now },
  })
);

//   Add Item to Cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productID, quantity = 1, user } = req.body;

    if (!productID || !user) {
      return res
        .status(400)
        .json({ message: "Product ID and user are required" });
    }

    let userCart = await Cart.findOne({ userID: user, status: "active" });

    if (!userCart) {
      userCart = new Cart({ userID: user, items: [], status: "active" });
    }

    const existingItemIndex = userCart.items.findIndex(
      (item) => item.productID === productID
    );

    if (existingItemIndex > -1) {
      userCart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      userCart.items.push({ productID, quantity: parseInt(quantity) });
    }

    userCart.updatedAt = new Date();
    await userCart.save();

    res
      .status(200)
      .json({ success: true, message: "Item added to cart", cart: userCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error, item has not been added",
    });
  }
});

// Get All Carts
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    console.error("Error fetching carts", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
});

// Delete Cart by ID
router.delete("/cart/:id", async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
      data: deletedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
