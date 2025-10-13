// src/controllers/docGiaController.js
import asyncHandler from "express-async-handler"; 
import DocGia from "../models/DocGia.js"; 


/**
 GET /api/docgia - Lấy danh sách độc giả (có hỗ trợ tìm kiếm và phân trang)
 */
export const getDocGias = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query; // Lấy giá trị query từ URL

  const query = {};

  // Nếu có từ khóa search thì thêm điều kiện tìm kiếm
  if (search) {
    const re = new RegExp(search, "i"); // "i" = không phân biệt hoa thường
    query.$or = [
      { ten: re },
      { hoLot: re },
      { maDocGia: re },
      { dienThoai: re },
    ]; // Tìm theo họ, tên, mã độc giả, hoặc điện thoại
  }

  // Xác định giới hạn và trang (ép kiểu sang số và đảm bảo >=1)
  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;

  // Chạy song song 2 truy vấn: đếm tổng số bản ghi + lấy danh sách theo trang
  const [total, items] = await Promise.all([
    DocGia.countDocuments(query),
    DocGia.find(query)
      .skip(skip)
      .limit(perPage) // Giới hạn số kết quả trả về
      .sort({ createdAt: -1 }), // Sắp xếp theo ngày tạo mới nhất
  ]);

  // Trả kết quả về cho client
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

/**
 * GET /api/docgia/:id - Lấy thông tin chi tiết 1 độc giả theo id
 */
export const getDocGiaById = asyncHandler(async (req, res) => {
  const doc = await DocGia.findById(req.params.id); // Tìm độc giả theo ID
  if (!doc)
    return res
      .status(404)
      .json({ success: false, message: "DocGia not found" }); // Nếu không có -> 404
  res.json({ success: true, data: doc }); // Nếu có -> trả dữ liệu
});

/**
 * POST /api/docgia - Tạo mới một độc giả
 */
export const createDocGia = asyncHandler(async (req, res) => {
  const { maDocGia } = req.body;

  if (!maDocGia)
    return res
      .status(400)
      .json({ success: false, message: "maDocGia is required" });

  // Kiểm tra mã độc giả có bị trùng không
  const exists = await DocGia.findOne({ maDocGia });
  if (exists)
    return res
      .status(409)
      .json({ success: false, message: "maDocGia already exists" });

  // Tạo mới độc giả
  const newDoc = await DocGia.create(req.body);
  res.status(201).json({ success: true, data: newDoc });
});

/**
 * ===============================
 * PUT /api/docgia/:id
 * Cập nhật thông tin độc giả theo ID
 * ===============================
 */
export const updateDocGia = asyncHandler(async (req, res) => {
  const updated = await DocGia.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Trả về bản ghi sau khi cập nhật
    runValidators: true, // Kiểm tra dữ liệu theo schema trước khi lưu
  });

  if (!updated)
    return res
      .status(404)
      .json({ success: false, message: "DocGia not found" });

  res.json({ success: true, data: updated });
});

/**
 * ===============================
 * DELETE /api/docgia/:id
 * Xóa độc giả theo ID
 * ===============================
 */
export const deleteDocGia = asyncHandler(async (req, res) => {
  const removed = await DocGia.findByIdAndDelete(req.params.id); // Xóa độc giả theo ID
  if (!removed)
    return res
      .status(404)
      .json({ success: false, message: "DocGia not found" });

  res.json({ success: true, message: "Deleted" });
});
