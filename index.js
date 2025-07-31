const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { router: authRoutes, authenticateJWT } = require("./auth");
const cartRoutes = require("./cart"); // Please share cart.js if you want it verified
app.use(authRoutes);
app.use(cartRoutes);

// ✅ MongoDB connection
mongoose.connect(
  "mongodb+srv://sahejbhatia748:Saahe123@cluster0.bafcj5b.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// ✅ Example product model (define this somewhere or import it)
const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
  })
);

// ✅ Products route
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Single product route
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "The item that you were searching for does not exist",
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
