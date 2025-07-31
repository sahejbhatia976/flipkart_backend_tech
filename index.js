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

const fs = require("fs");
const path = require("path");

// Import and insert product data once MongoDB connects
mongoose.connection.once("open", async () => {
  console.log("MongoDB connected");

  try {
    // Read product.json file
    const filePath = path.join(__dirname, "product.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(jsonData);

    // Check if products already exist to prevent duplication
    const existing = await Product.countDocuments();
    if (existing === 0) {
      await Product.insertMany(products);
      console.log("✅ Products inserted successfully into MongoDB!");
    } else {
      console.log("📝 Products already exist in the database.");
    }
  } catch (err) {
    console.error("❌ Failed to insert products:", err.message);
  }
});

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
