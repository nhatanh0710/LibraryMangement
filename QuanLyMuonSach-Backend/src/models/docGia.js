// src/models/docGia.js
import mongoose from "mongoose";

const docGiaSchema = new mongoose.Schema(
  {
    maDocGia: { type: String, required: true, unique: true },
    hoLot: { type: String, required: true },
    ten: { type: String, required: true },
    ngaySinh: { type: Date },
    phai: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },
    diaChi: { type: String },
    dienThoai: { type: String },
    password: { type: String, required: false, default: "" },
  },
  {
    timestamps: true, // tự động thêm createdAt, updatedAt
  }
);

// Index để tìm kiếm nhanh (thường dùng cho search theo tên)
docGiaSchema.index({ ten: "text", hoLot: "text", maDocGia: 1, dienThoai: 1 });

export default mongoose.model("DocGia", docGiaSchema);
