const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// User Schema - will create a "users" collection in your Product-data database
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

// Test route for auth
router.get("/auth/test", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      message: "Auth system working",
      userCount,
      database: mongoose.connection.db.databaseName,
    });
  } catch (error) {
    console.error("❌ Auth test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Signup router
router.post("/auth/signup", async (req, res) => {
  try {
    console.log("📝 Signup attempt:", req.body.email);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password - FIXED: correct syntax
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();
    console.log("✅ User created successfully:", email);

    // Generate JWT token
    const token = jwt.sign(
      {
        userID: user._id,
        email: user.email,
      },
      "secret", // In production, use process.env.JWT_SECRET
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Login router - FIXED: added missing "/" in route
router.post("/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userID: user._id,
        email: user.email,
      },
      "secret", // In production, use process.env.JWT_SECRET
      { expiresIn: "24h" }
    );

    console.log("✅ Login successful:", email);
    res.json({
      token,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user profile (protected route)
router.get("/auth/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userID).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// JWT middleware - FIXED: token extraction bug
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // FIXED: split(" ") not split("")
    const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        console.error("❌ JWT verification error:", err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
}

module.exports = {
  router,
  authenticateJWT,
};
