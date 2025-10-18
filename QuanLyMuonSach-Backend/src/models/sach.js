import mongoose from "mongoose";

const sachSchema = new mongoose.Schema(
  {
    maSach: { type: String, required: true, unique: true },
    tenSach: { type: String, required: true },
    donGia: { type: Number, required: true },
    soQuyen: { type: Number, required: true, default: 1 },
    namXuatBan: { type: Number },
    maNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaXuatBan",
      // required: true,
    },
    tacGia: { type: String, required: true },
    soQuyenConLai: { type: Number, required: true, default: 1 },
    moTa: { type: String },
    hinhAnh: { type: String },
},
  { timestamps: true }
);

// Index để tìm kiếm nhanh (thường dùng cho search theo tên)
sachSchema.index({ tenSach: "text", maSach: 1, tacGia: "text" });
export default mongoose.model("Sach", sachSchema);
