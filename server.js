const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Agar frontend bisa akses API
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("Tokolbu"); // nama database kamu
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

connectDB();

// ========== API ROUTES ==========

// GET semua produk
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.collection("catalog").find({}).toArray();
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET produk by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await db.collection("catalog").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Produk tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET produk by tag
app.get("/api/products/tag/:tag", async (req, res) => {
  try {
    const products = await db
      .collection("catalog")
      .find({ tag: req.params.tag })
      .toArray();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
