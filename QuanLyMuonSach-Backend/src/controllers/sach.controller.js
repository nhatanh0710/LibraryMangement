// controllers/sachController.js
import asyncHandler from "express-async-handler";
import Sach from "../models/sach.js";
// Nếu bạn có model Phiếu Mượn để check quan hệ, import ở đây
// import PhieuMuon from "../models/phieuMuon.js";

const buildFileUrl = (req, filename) => {
  if (!filename) return "";
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// GET /api/sach - Lấy danh sách sách (tìm kiếm + phân trang)
export const getSachs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};
  if (search) {
    const re = new RegExp(String(search), "i");
    query.$or = [{ tenSach: re }, { maSach: re }, { tacGia: re }];
  }
  const perPage = Math.max(1, Number(limit) || 10);
  const skip = (Math.max(1, Number(page) || 1) - 1) * perPage;

  const [total, items] = await Promise.all([
    Sach.countDocuments(query),
    Sach.find(query)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("maNXB", "tenNXB"),
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

// GET /api/sach/:id
export const getSachById = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id).populate("maNXB", "tenNXB");
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sách không tồn tại" });
  res.json({ success: true, data: item });
});

// POST /api/sach
export const createSach = asyncHandler(async (req, res) => {
  // Nếu FE gửi FormData, multer đã xử lý file ở req.file; các field ở req.body (strings)
  const { maSach, tenSach, donGia, soQuyen, namXuatBan, maNXB, tacGia, moTa } =
    req.body;

  // Validate required fields
  if (
    !maSach ||
    !tenSach ||
    donGia === undefined ||
    soQuyen === undefined ||
    !tacGia ||
    namXuatBan === undefined ||
    !moTa
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }

  // Kiểm tra mã trùng
  const existingSach = await Sach.findOne({ maSach });
  if (existingSach)
    return res
      .status(400)
      .json({ success: false, message: "Mã sách đã tồn tại" });

  // Parse number fields an toàn
  const donGiaNum = Number(donGia) || 0;
  const soQuyenNum = Number(soQuyen) || 0;
  const namNum = Number(namXuatBan) || null;

  // Xử lý file nếu có (multer)
  let hinhAnhUrl = req.body.hinhAnh || ""; // fallback nếu client gửi URL trực tiếp
  if (req.file && req.file.filename) {
    hinhAnhUrl = buildFileUrl(req, req.file.filename);
  }

  const newSach = new Sach({
    maSach,
    tenSach,
    donGia: donGiaNum,
    soQuyen: soQuyenNum,
    soQuyenConLai: soQuyenNum,
    namXuatBan: namNum,
    //maNXB,
    tacGia,
    moTa,
    hinhAnh: hinhAnhUrl,
  });

  await newSach.save();
  res.status(201).json({ success: true, data: newSach });
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
});

// PUT /api/sach/:id
export const updateSach = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sách không tồn tại" });

  const { maSach, tenSach, donGia, soQuyen, namXuatBan, maNXB, tacGia, moTa } =
    req.body;

  // Nếu đổi mã sách, kiểm tra trùng
  if (maSach && maSach !== item.maSach) {
    const existingSach = await Sach.findOne({ maSach });
    if (existingSach)
      return res
        .status(400)
        .json({ success: false, message: "Mã sách đã tồn tại" });
    item.maSach = maSach;
  }

  if (tenSach) item.tenSach = tenSach;
  if (donGia !== undefined) item.donGia = Number(donGia) || item.donGia;
  if (soQuyen !== undefined) {
    // chỉ cập nhật số lượng toàn bộ
    const newSoQuyen = Number(soQuyen) || item.soQuyen;
    // Nếu giảm tổng số lượng dưới số đang mượn -> có thể gây vấn đề; bạn có thể kiểm tra soQuyenConLai
    if (newSoQuyen < item.soQuyen - (item.soQuyen - item.soQuyenConLai)) {
      // logic phức tạp tuỳ quy tắc: ở đây ta prevent giảm nhỏ hơn số đang mượn
      return res.status(400).json({
        success: false,
        message: "Không thể giảm tổng số lượng nhỏ hơn số lượng đang mượn",
      });
    }
    item.soQuyen = newSoQuyen;
  }
  if (namXuatBan !== undefined)
    item.namXuatBan = Number(namXuatBan) || item.namXuatBan;
  if (maNXB) item.maNXB = maNXB;
  if (tacGia) item.tacGia = tacGia;
  if (moTa) item.moTa = moTa;

  // Xử lý file mới nếu có
  if (req.file && req.file.filename) {
    const newUrl = buildFileUrl(req, req.file.filename);
    //xóa ảnh cũ

    item.hinhAnh = newUrl;
  } else if (req.body.hinhAnh) {
    // nếu client gửi hinhAnh là URL, cập nhật
    item.hinhAnh = req.body.hinhAnh;
  }

  await item.save();
  res.json({ success: true, data: item });
});

// DELETE /api/sach/:id
export const deleteSach = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sách không tồn tại" });

  // Cách kiểm tra đơn giản: nếu soQuyenConLai < soQuyen => có sách đang được mượn
  if (
    typeof item.soQuyen === "number" &&
    typeof item.soQuyenConLai === "number"
  ) {
    if (item.soQuyenConLai < item.soQuyen) {
      return res.status(400).json({
        success: false,
        message: "Không thể xoá sách đang có người mượn",
      });
    }
  }
  await item.deleteOne();
  // TODO: nếu lưu file ảnh local, có thể xóa file trên disk ở đây
  res.json({ success: true, message: "Xoá sách thành công" });
});
