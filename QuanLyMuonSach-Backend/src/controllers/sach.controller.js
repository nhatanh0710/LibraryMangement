import asyncHandler from "express-async-handler";
import Sach from "../models/sach.js";

// GET /api/sach - Lấy danh sách sách (có hỗ trợ tìm kiếm và phân trang)
export const getSachs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query; // Lấy giá trị query từ URL
  const query = {};
  if (search) {
    const re = new RegExp(search, "i");
    query.$or = [{ tenSach: re }, { maSach: re }, { tacGia: re }];
  }
  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;
  const [total, items] = await Promise.all([
    Sach.countDocuments(query),
    Sach.find(query)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate("maNXB", "tenNXB"), // Lấy tên nhà xuất bản
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

// GET /api/sach/:id - Lấy thông tin chi tiết 1 sách theo id
export const getSachById = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id).populate("maNXB", "tenNXB");
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sach không tồn tại" });
  res.json({ success: true, data: item });
});

// POST /api/sach - Thêm mới sách
export const createSach = asyncHandler(async (req, res) => {
  const { maSach, tenSach, donGia, soQuyen, namXuatBan, maNXB, tacGia, moTa } =
    req.body;
  if (!maSach || !tenSach || !donGia || !soQuyen || !maNXB || !tacGia) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }
  const existingSach = await Sach.findOne({ maSach });
  if (existingSach)
    return res
      .status(400)
      .json({ success: false, message: "Mã sách đã tồn tại" });
  const newSach = new Sach({
    maSach,
    tenSach,
    donGia,
    soQuyen,
    soQuyenConLai: soQuyen,
    namXuatBan,
    maNXB,
    tacGia,
    moTa,
  });
  await newSach.save();
  res.status(201).json({ success: true, data: newSach });
});

// PUT /api/sach/:id - Cập nhật thông tin sách theo ID
export const updateSach = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sach không tồn tại" });
  const { maSach, tenSach, donGia, soQuyen, namXuatBan, maNXB, tacGia, moTa } =
    req.body;
  if (maSach && maSach !== item.maSach) {
    const existingSach = await Sach.findOne({ maSach });
    if (existingSach)
      return res
        .status(400)
        .json({ success: false, message: "Mã sách đã tồn tại" });
    item.maSach = maSach;
  }

  if (tenSach) item.tenSach = tenSach;
  if (donGia) item.donGia = donGia;
  if (soQuyen) {
    item.soQuyen = soQuyen; // Chỉ cập nhật số lượng mới
    // Không cập nhật soQuyenConLai ở đây, sẽ xử lý khi duyệt đơn mượn/trả sách
  }
  if (namXuatBan) item.namXuatBan = namXuatBan;
  if (maNXB) item.maNXB = maNXB;
  if (tacGia) item.tacGia = tacGia;
  if (moTa) item.moTa = moTa;
  await item.save();
  res.json({ success: true, data: item });
});

// DELETE /api/sach/:id - Xoá sách
export const deleteSach = asyncHandler(async (req, res) => {
  const item = await Sach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "Sách không tồn tại" });
  // Kiểm tra xem sách có đang được mượn không
  if (sach.SoLuongDangMuon > 0) {
    return res.status(400).json({
      success: false,
      message: "Không thể xoá sách đang có người mượn",
    });
  }
  await item.remove();
  res.json({ success: true, message: "Xoá sách thành công" });
});

