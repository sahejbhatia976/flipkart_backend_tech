const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { router: authRoutes, authenticateJWT } = require("./auth");
const cartRoutes = require("./cart");
app.use(authRoutes);
app.use(cartRoutes);

mongoose.connect(
  "mongodb+srv://sahejbhatia748:Saahe123@cluster0.bafcj5b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const productSchema = new mongoose.Schema({ name: String, price: Number });
const Product = mongoose.model("Product", productSchema);
module.exports.Product = Product;

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "There is internal server error" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "The items that you were searching for does not exists",
      });
    } else {
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
