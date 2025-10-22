// src/controllers/docGiaController.js
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import DocGia from "../models/DocGia.js";
import theoDoiMuonSach from "../models/theoDoiMuonSach.js";

// POST /api/docgia/register
export const registerDocGia = asyncHandler(async (req, res) => {
  const { maDocGia, hoLot, ten, dienThoai, password } = req.body;
  if (!maDocGia || !hoLot || !ten || !password) {
    res.status(400);
    throw new Error("Vui lòng cung cấp maDocGia, hoLot, ten và password");
  }

  const exists = await DocGia.findOne({ maDocGia });
  if (exists) {
    res.status(400);
    throw new Error("maDocGia đã tồn tại");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const docGia = await DocGia.create({
    maDocGia,
    hoLot,
    ten,
    dienThoai,
    password: hashed,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: docGia._id,
      maDocGia: docGia.maDocGia,
      hoLot: docGia.hoLot,
      ten: docGia.ten,
      token: createToken(docGia._id, "DOCGIA"),
    },
  });
});

// POST /api/docgia/login
export const loginDocGia = asyncHandler(async (req, res) => {
  const { maDocGia, password } = req.body;
  if (!maDocGia || !password) {
    res.status(400);
    throw new Error("Cần maDocGia và password");
  }

  const user = await DocGia.findOne({ maDocGia });
  if (!user) {
    res.status(401);
    throw new Error("Tài khoản không tồn tại");
  }
  if (!user.password) {
    res.status(401);
    throw new Error("Tài khoản chưa có mật khẩu, vui lòng liên hệ thư viện");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Mật khẩu không đúng");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      maDocGia: user.maDocGia,
      hoLot: user.hoLot,
      ten: user.ten,
      token: createToken(user._id, "DOCGIA"),
    },
  });
});

/**
 GET /api/docgia - Lấy danh sách độc giả (có hỗ trợ tìm kiếm và phân trang)
 */
export const getDocGias = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};
  if (search) {
    const re = new RegExp(search, "i");
    query.$or = [
      { ten: re },
      { hoLot: re },
      { maDocGia: re },
      { dienThoai: re },
    ];
  }

  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;

  const [total, items] = await Promise.all([
    DocGia.countDocuments(query),
    DocGia.find(query).skip(skip).limit(perPage).sort({ maDocGia: 1 }),
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

/**
 * GET /api/docgia/:id - Lấy thông tin chi tiết 1 độc giả theo id
 */
export const getDocGiaById = asyncHandler(async (req, res) => {
  const doc = await DocGia.findById(req.params.id);
  if (!doc) {
    res.status(404);
    return res.json({ success: false, message: "DocGia not found" });
  }
  res.json({ success: true, data: doc });
});

/**
 * POST /api/docgia - Tạo mới một độc giả
 */
export const createDocGia = asyncHandler(async (req, res) => {
  const { maDocGia } = req.body;
  if (!maDocGia) {
    res.status(400);
    return res.json({ success: false, message: "maDocGia is required" });
  }

  const exists = await DocGia.findOne({ maDocGia });
  if (exists) {
    res.status(409);
    return res.json({ success: false, message: "maDocGia already exists" });
  }

  const newDoc = await DocGia.create(req.body);
  res.status(201).json({ success: true, data: newDoc });
});

/**
 * PUT /api/docgia/:id - Cập nhật
 */
export const updateDocGia = asyncHandler(async (req, res) => {
  const updated = await DocGia.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    res.status(404);
    return res.json({ success: false, message: "DocGia not found" });
  }

  res.json({ success: true, data: updated });
});

/**
 * DELETE /api/docgia/:id - Xóa (kiểm tra mượn trước khi xóa)
 */
export const deleteDocGia = asyncHandler(async (req, res) => {
  // tìm độc giả trước
  const doc = await DocGia.findById(req.params.id);
  if (!doc) {
    res.status(404);
    return res.json({ success: false, message: "DocGia not found" });
  }

  // kiểm tra độc giả có mượn sách (dùng maDocGia nếu có, fallback _id)
  const checkField = doc.maDocGia
    ? { maDocGia: doc.maDocGia }
    : { maDocGia: req.params.id };
  const hasBorrowed = await theoDoiMuonSach.findOne({
    ...checkField,
    trangThai: "ĐÃ DUYỆT",
  });

  if (hasBorrowed) {
    return res.status(400).json({
      success: false,
      message: "Không thể xoá độc giả đang có sách mượn",
    });
  }

  // nếu không mượn -> xóa
  await DocGia.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
