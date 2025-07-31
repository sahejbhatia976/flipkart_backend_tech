const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Auth & cart routes
const { router: authRoutes, authenticateJWT } = require("./auth");
const cartRoutes = require("./cart");
app.use(authRoutes);
app.use(cartRoutes);

// MongoDB connection with CORRECT database name
mongoose
  .connect(
    "mongodb+srv://sahejbhatia748:Saahe123@cluster0.bafcj5b.mongodb.net/Product-data?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas - Database: Product-data");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected");
});

// Product Schema & Model - using EXACT collection name "Products"
const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    brand: String,
    category: String,
    thumbnail: String,
    images: [String],
  },
  {
    collection: "Products", // Explicitly specify collection name
  }
);

const Product = mongoose.model("Product", productSchema);

// Test route to check database connection and data
app.get("/test-products", async (req, res) => {
  try {
    console.log("Testing database connection...");
    const count = await Product.countDocuments();
    const sample = await Product.findOne();
    console.log(`Database test - Found ${count} products`);

    res.json({
      success: true,
      count,
      message: `Found ${count} products in database`,
      sample: sample || "No sample product found",
      collectionName: Product.collection.name,
      databaseName: mongoose.connection.db.databaseName,
    });
  } catch (error) {
    console.error("❌ Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Product Routes with enhanced error handling
app.get("/products", async (req, res) => {
  try {
    console.log("📦 Fetching all products from Products collection...");
    const products = await Product.find();
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      return res.json({
        message: "No products found in database",
        products: [],
      });
    }

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    console.log(`🔍 Fetching product with ID: ${req.params.id}`);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid product ID format",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log(`❌ Product not found: ${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`✅ Found product: ${product.title}`);
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

// Additional helpful routes
app.get("/products/category/:category", async (req, res) => {
  try {
    console.log(`🔍 Fetching products in category: ${req.params.category}`);
    const products = await Product.find({ category: req.params.category });
    console.log(
      `✅ Found ${products.length} products in category: ${req.params.category}`
    );
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products by category:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    console.log(`🔍 Searching products for: ${query}`);

    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    console.log(`✅ Found ${products.length} products matching: ${query}`);
    res.json(products);
  } catch (error) {
    console.error("❌ Error searching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// Server
app.listen(8080, () => {
  console.log("🚀 Server is running on port 8080");
  console.log("📋 Available routes:");
  console.log("   GET /test-products - Test database connection");
  console.log("   GET /products - Get all products");
  console.log("   GET /product/:id - Get single product");
  console.log("   GET /products/category/:category - Get products by category");
  console.log("   GET /products/search/:query - Search products");
  console.log("📊 Expected to find 396 products in 'Products' collection");
});
