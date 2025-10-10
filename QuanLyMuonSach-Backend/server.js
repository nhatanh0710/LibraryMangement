import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Library Management Backend is running 🚀");
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ Database connection failed:", err));
