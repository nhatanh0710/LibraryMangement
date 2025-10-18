// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";

dotenv.config();
const app = express();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// CORS - cho phép origin dev của bạn (vite)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Optional: log incoming requests (helps debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
app.get("/", (req, res) => {
  res.send("Library Management Backend is running 🚀");
});

// Register /api routes AFTER CORS and body parser
app.use("/api", routes);

// Error handler (dev)
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Start server only after DB connected
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI;

(async () => {
  try {
    await connectDB(URI); // ensure DB connected first
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
