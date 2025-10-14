import mongoose from "mongoose";

const nhanVienSchema = new mongoose.Schema(
  {
    msnv: { type: String, required: true, unique: true },
    hoTenNV: { type: String, required: true },
    password: { type: String, required: true },
    chucVu: {
      type: String,
      enum: ["NHÂN VIÊN", "GIÁM ĐỐC"],
      default: "NHÂN VIÊN",
    },
    diaChi: { type: String, default: "" },
    soDienThoai: { type: String, default: "" },
    trangThai: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.model("NhanVien", nhanVienSchema);
