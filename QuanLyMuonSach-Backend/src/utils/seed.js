import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import NhanVien from "../models/nhanVien.js";
import { connectDB } from "../config/db.js";

const run = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const exists = await NhanVien.findOne({ msnv: "admin" });
    if (exists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hash = await bcrypt.hash("admin123", 10);
    await NhanVien.create({
      msnv: "admin",
      hoTenNV: "Administrator",
      password: hash,
      chucVu: "GIÁM ĐỐC",
    });
    console.log("Created admin: msnv=admin, password=admin123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
