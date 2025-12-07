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
// Hàm tính số ngày trễ
// Hàm tính số ngày trễ (giữ nguyên)
function calculateLateDays(ngayDuKienTra, ngayTra = null) {
  const due = new Date(ngayDuKienTra);
  const checkDate = ngayTra ? new Date(ngayTra) : new Date();
  
  if (checkDate <= due) return 0;
  
  const diff = Math.ceil((checkDate - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}



/** -----------------------------------------------------
 *  GET /api/theodoimuonsach
 *  Lấy danh sách phiếu mượn
 * ----------------------------------------------------*/
export const getTheoDoiMuonSachs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, search, maDocGia, maSach } = req.query;

  const query = {};

  // Lọc độc giả
  if (maDocGia) {
    if (mongoose.isValidObjectId(maDocGia)) {
      query.maDocGia = maDocGia;
    } else {
      const dg = await DocGia.findOne({ maDocGia });
      if (!dg)
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit, totalPages: 0 },
        });
      query.maDocGia = dg._id;
    }
  }

  // Lọc sách
  if (maSach) {
    if (mongoose.isValidObjectId(maSach)) {
      query.maSach = maSach;
    } else {
      const sach = await Sach.findOne({ maSach });
      if (!sach)
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit, totalPages: 0 },
        });
      query.maSach = sach._id;
    }
  }

  // Search fuzzy
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

  let items = await TheoDoiMuonSach.find(query)
    .populate("maDocGia", "maDocGia ten hoLot")
    .populate("maSach", "maSach tenSach tacGia")
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: -1 });

  // Trong phần GET /api/theodoimuonsach - SỬA LẠI ĐỂ TÍNH ĐÚNG
  for (let item of items) {
    let changed = false;

    // LUÔN tính số ngày trễ mới nhất
    let lateDays = 0;

    if (item.ngayTra) {
      // Đã trả: tính từ hạn trả đến ngày trả
      lateDays = calculateLateDays(item.ngayDuKienTra, item.ngayTra);
    } else {
      // Chưa trả: tính từ hạn trả đến hôm nay
      lateDays = calculateLateDays(item.ngayDuKienTra);
    }

    // Nếu số ngày trễ thay đổi
    if (item.soNgayTre !== lateDays) {
      item.soNgayTre = lateDays;
      item.tienPhat = lateDays * 2000; // 2.000đ/ngày
      changed = true;
    }

    // Tự động cập nhật trạng thái
    if (lateDays > 0) {
      if (!item.ngayTra && item.trangThai !== "HẾT HẠN") {
        item.trangThai = "HẾT HẠN";
        item.treHan = true;
        changed = true;
      } else if (item.ngayTra && item.trangThai !== "TRẢ TRỄ") {
        item.trangThai = "TRẢ TRỄ";
        item.treHan = true;
        changed = true;
      }
    } else {
      // Không trễ
      item.treHan = false;
      if (item.ngayTra && item.trangThai !== "ĐÃ TRẢ") {
        item.trangThai = "ĐÃ TRẢ";
        changed = true;
      }
    }

    if (changed) await item.save();
  }

  const total = await TheoDoiMuonSach.countDocuments(query);

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
// TRONG createTheoDoiMuonSach controller
export const createTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const { maDocGia, maSach, ngayMuon } = req.body;

  if (!maDocGia || !maSach) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  const checkDocGia = await DocGia.findById(maDocGia);
  if (!checkDocGia)
    return res
      .status(400)
      .json({ success: false, message: "Mã độc giả không hợp lệ" });

  // QUAN TRỌNG: Tự động tính ngày dự kiến trả = ngày mượn + 14 ngày
  const ngayMuonDate = ngayMuon ? new Date(ngayMuon) : new Date();
  const ngayDuKienTra = new Date(ngayMuonDate);
  ngayDuKienTra.setDate(ngayMuonDate.getDate() + 14);

  const newItem = await TheoDoiMuonSach.create({
    maDocGia,
    maSach,
    ngayMuon: ngayMuonDate,
    ngayDuKienTra, // <-- Đã tính tự động
    trangThai: "CHỜ DUYỆT",
  });

  const populated = await TheoDoiMuonSach.findById(newItem._id)
    .populate("maDocGia", "hoLot ten maDocGia")
    .populate("maSach", "tenSach maSach tacGia");

  res.status(201).json({ success: true, data: populated });
});

/** -----------------------------------------------------
 *  PUT /api/theodoimuonsach/:id
 *  Cập nhật phiếu mượn + xử lý kho - TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
 * ----------------------------------------------------*/
export const updateTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const old = await TheoDoiMuonSach.findById(req.params.id);
  if (!old)
    return res
      .status(404)
      .json({ success: false, message: "Phiếu mượn không tồn tại" });

  const oldStatus = old.trangThai;
  const updateData = { ...req.body };

  // 1) NẾU CÓ NGÀY TRẢ → TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
  if (updateData.ngayTra !== undefined) {
    const ngayTra = updateData.ngayTra;
    const lateDays = calculateLateDays(old.ngayDuKienTra, ngayTra);

    // Xóa trạng thái từ frontend nếu có (để dùng logic tự động)
    delete updateData.trangThai;

    if (lateDays > 0) {
      updateData.trangThai = "TRẢ TRỄ";
      updateData.treHan = true;
      updateData.soNgayTre = lateDays;
      updateData.tienPhat = lateDays * 2000;
    } else {
      updateData.trangThai = "ĐÃ TRẢ";
      updateData.treHan = false;
      updateData.soNgayTre = 0;
      updateData.tienPhat = 0;
    }

    // Trả sách thì phải cộng kho lại nếu trước đó đã duyệt
    if (oldStatus === "ĐÃ DUYỆT") {
      await updateStock(old.maSach, +1);
    }
  }
  // 2) NẾU KHÔNG CÓ NGÀY TRẢ NHƯNG CÓ THAY ĐỔI TRẠNG THÁI
  else if (updateData.trangThai) {
    const newStatus = updateData.trangThai;
    
    // Xử lý kho khi thay đổi trạng thái
    if (oldStatus === "CHỜ DUYỆT" && newStatus === "ĐÃ DUYỆT") {
      await updateStock(old.maSach, -1);
    } else if (oldStatus === "ĐÃ DUYỆT" && newStatus === "CHỜ DUYỆT") {
      await updateStock(old.maSach, +1);
    }
    // Nếu từ ĐÃ DUYỆT sang HẾT HẠN thì không làm gì (vẫn giữ trạng thái đã trừ kho)
  }

  // 3) CẬP NHẬT VÀ TRẢ VỀ
  const updated = await TheoDoiMuonSach.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate("maDocGia", "hoLot ten maDocGia")
   .populate("maSach", "tenSach maSach tacGia");

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
