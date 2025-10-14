import mongoose from "mongoose";

const muonSachSchema = new mongoose.Schema(
  {
    maDocGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocGia",
      required: true,
    },
    maSach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sach",
      required: true,
    },
    ngayMuon: { type: Date, default: Date.now },
    ngayTra: { type: Date },
    ngayDuKienTra: { type: Date, required: true },
    trangThai: {
      type: String,
      enum: ["ĐÃ DUYỆT", "ĐÃ TRẢ", "HẾT HẠN", "CHỜ DUYỆT", "TỪ CHỐI"],
      default: "CHỜ XÁC NHẬN",
    },
  },
  { timestamps: true }
);

muonSachSchema.index({ ngayDuKienTra: 1 });

export default mongoose.model("TheoDoiMuonSach", muonSachSchema);
