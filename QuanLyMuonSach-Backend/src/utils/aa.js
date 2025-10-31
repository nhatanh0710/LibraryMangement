// scripts/hash-passwords.js
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/nhanVien.js";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { connectDB } from "../config/db.js";
await connectDB(process.env.MONGO_URI);

// hash function
const hashIfPlain = async (Model, filter = {}) => {
  const docs = await Model.find(filter).lean();
  for (const d of docs) {
    const id = d._id;
    const pwd = d.password || "";
    if (!pwd) continue; // skip empty
    if (typeof pwd === "string" && pwd.startsWith("$2")) continue; // already hashed
    const hashed = await bcrypt.hash(pwd, 10);
    await Model.updateOne({ _id: id }, { $set: { password: hashed } });
    console.log("Hashed", Model.modelName, id.toString());
  }
};

await hashIfPlain(DocGia);
await hashIfPlain(NhanVien);

await mongoose.disconnect();
console.log("Done");
