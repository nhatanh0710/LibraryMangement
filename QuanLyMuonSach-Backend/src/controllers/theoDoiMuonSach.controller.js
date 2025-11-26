import asyncHandler from "express-async-handler";
import TheoDoiMuonSach from "../models/theoDoiMuonSach.js";
import DocGia from "../models/DocGia.js";
import Sach from "../models/sach.js";
import mongoose from "mongoose";

/** -----------------------------------------------------
 *  HÀM HỖ TRỢ: Cập nhật tồn kho sách
 *  change = +1 (cộng), -1 (trừ)
 * ----------------------------------------------------*/
async function updateStock(sachId, change) {
  await Sach.findByIdAndUpdate(
    sachId,
    { $inc: { soQuyenConLai: change } },
    { new: true }
  );
}

/** -----------------------------------------------------
 *  GET /api/theodoimuonsach
 *  Lấy danh sách phiếu mượn
 * ----------------------------------------------------*/
export const getTheoDoiMuonSachs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, search, maDocGia, maSach } = req.query;

  const query = {};

  // Tìm theo mã độc giả (hỗ trợ ObjectId hoặc mã DGxxx)
  if (maDocGia) {
    if (mongoose.isValidObjectId(maDocGia)) {
      query.maDocGia = maDocGia;
    } else {
      const dg = await DocGia.findOne({ maDocGia });
      if (!dg)
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        });
      query.maDocGia = dg._id;
    }
  }

  // Tìm theo mã sách
  if (maSach) {
    if (mongoose.isValidObjectId(maSach)) {
      query.maSach = maSach;
    } else {
      const sach = await Sach.findOne({ maSach });
      if (!sach)
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        });
      query.maSach = sach._id;
    }
  }

  // Tìm kiếm fuzzy
  if (search) {
    const re = new RegExp(search, "i");
    query.$or = [
      { "maDocGia.maDocGia": re },
      { "maSach.maSach": re },
      { "maSach.tenSach": re },
    ];
  }

  const perPage = Number(limit);
  const skip = (Number(page) - 1) * perPage;

  const [total, items] = await Promise.all([
    TheoDoiMuonSach.countDocuments(query),
    TheoDoiMuonSach.find(query)
      .populate("maDocGia", "maDocGia ten hoLot")
      .populate("maSach", "maSach tenSach tacGia")
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      total,
      page: Number(page),
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  });
});

/** -----------------------------------------------------
 *  GET /api/theodoimuonsach/:id
 * ----------------------------------------------------*/
export const getTheoDoiMuonSachById = asyncHandler(async (req, res) => {
  const item = await TheoDoiMuonSach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Phiếu mượn không tồn tại" });

  res.json({ success: true, data: item });
});

/** -----------------------------------------------------
 *  POST /api/theodoimuonsach
 *  Tạo phiếu mượn – không trừ kho ở bước này
 * ----------------------------------------------------*/
export const createTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const { maDocGia, maSach, ngayMuon, ngayDuKienTra, ngayTra, trangThai } =
    req.body;

  if (!maDocGia || !maSach || !ngayMuon || !ngayDuKienTra || !trangThai) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  const checkDocGia = await DocGia.findById(maDocGia);
  if (!checkDocGia)
    return res
      .status(400)
      .json({ success: false, message: "Mã độc giả không hợp lệ" });

  const newItem = await TheoDoiMuonSach.create({
    maDocGia,
    maSach,
    ngayMuon,
    ngayDuKienTra,
    ngayTra,
    trangThai,
  });

  const populated = await TheoDoiMuonSach.findById(newItem._id)
    .populate("maDocGia", "hoLot ten maDocGia")
    .populate("maSach", "tenSach maSach tacGia");

  res.status(201).json({ success: true, data: populated });
});

/** -----------------------------------------------------
 *  PUT /api/theodoimuonsach/:id
 *  Cập nhật phiếu mượn + xử lý kho
 * ----------------------------------------------------*/
export const updateTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const { trangThai, ngayTra } = req.body;

  const old = await TheoDoiMuonSach.findById(req.params.id);
  if (!old)
    return res
      .status(404)
      .json({ success: false, message: "Phiếu mượn không tồn tại" });

  const oldStatus = old.trangThai;
  let newStatus = trangThai;

  // Nếu có ngày trả thì auto set trạng thái thành ĐÃ TRẢ
  if (ngayTra && newStatus !== "ĐÃ TRẢ") {
    newStatus = "ĐÃ TRẢ";
    req.body.trangThai = "ĐÃ TRẢ";
  }

  // XỬ LÝ TỒN KHO
  if (oldStatus !== newStatus) {
    if (oldStatus === "CHỜ DUYỆT" && newStatus === "ĐÃ DUYỆT") {
      await updateStock(old.maSach, -1); // Trừ kho
    }
    if (oldStatus === "ĐÃ DUYỆT" && newStatus === "ĐÃ TRẢ") {
      await updateStock(old.maSach, +1); // Trả lại kho
    }
    if (oldStatus === "ĐÃ DUYỆT" && newStatus === "CHỜ DUYỆT") {
      await updateStock(old.maSach, +1); // Hủy duyệt
    }
  }

  const updated = await TheoDoiMuonSach.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({ success: true, data: updated });
});

/** -----------------------------------------------------
 *  DELETE /api/theodoimuonsach/:id
 *  Xóa phiếu + trả kho nếu cần
 * ----------------------------------------------------*/
export const deleteTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const phieu = await TheoDoiMuonSach.findById(id);
  if (!phieu)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phiếu mượn" });

  // Quyền của Độc giả
  if (req.userType === "DOCGIA") {
    if (phieu.maDocGia.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa phiếu này",
      });
    }
    if (phieu.trangThai !== "CHỜ DUYỆT") {
      return res
        .status(400)
        .json({ success: false, message: "Chỉ được xóa phiếu CHỜ DUYỆT" });
    }
  }

  // Quyền của Nhân viên
  if (req.userType === "NHANVIEN") {
    if (!["ĐÃ TRẢ", "CHỜ DUYỆT"].includes(phieu.trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Nhân viên chỉ được xóa phiếu 'ĐÃ TRẢ' hoặc 'CHỜ DUYỆT'",
      });
    }
  }

  // Hoàn kho nếu phiếu đã duyệt nhưng chưa trả
  if (phieu.trangThai === "ĐÃ DUYỆT") {
    await updateStock(phieu.maSach, +1);
  }

  await TheoDoiMuonSach.findByIdAndDelete(id);

  res.json({ success: true, message: "Xóa phiếu mượn thành công" });
});
