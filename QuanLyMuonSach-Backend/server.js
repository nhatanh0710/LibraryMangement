import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Library Management Backend is running 🚀");
});

// Connect MongoDB
const URI = process.env.MONGO_URI;
connectDB(URI);

app.use("/api", routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
