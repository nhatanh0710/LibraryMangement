import mongoose from "mongoose";

const nhaXuatBanSchema = new mongoose.Schema({
        maNXB: { type: String, required: true, unique: true },
        tenNXB: { type: String, required: true },
        diaChi: { type: String, default: "" },
    },
    { timestamps: true });

export default mongoose.model("NhaXuatBan", nhaXuatBanSchema);