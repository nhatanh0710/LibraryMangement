// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/nhanVien.js";

/**
 * protect: middleware xác thực access token (Authorization: Bearer <token>)
 * - verify token
 * - load user từ DB (DocGia hoặc NhanVien)
 * - gắn req.user, req.userType, req.userRole
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Không có token, vui lòng đăng nhập");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded: { id, type, role?, iat, exp }
    const { id, type, role } = decoded;

    // load user from DB to ensure it's valid (and to get fresh data)
    if (type === "DOCGIA") {
      req.user = await DocGia.findById(id).select("-password -refreshTokens");
      req.userType = "DOCGIA";
    } else {
      req.user = await NhanVien.findById(id).select("-password -refreshTokens");
      req.userType = "NHANVIEN";
    }

    if (!req.user) {
      res.status(401);
      throw new Error("Người dùng không tồn tại");
    }

    // attach role from token (may be null) and also prefer DB value if present
    req.userRole = role || req.user.chucVu || null;

    next();
  } catch (err) {
    // phân biệt token hết hạn để thông báo rõ
    if (err && err.name === "TokenExpiredError") {
      res.status(401);
      throw new Error("Token hết hạn");
    }
    res.status(401);
    throw new Error("Token không hợp lệ hoặc hết hạn");
  }
});

/**
 * authorizeRole(...allowedRoles)
 * - Dùng cho routes cần phân quyền theo chức vụ (chỉ áp dụng cho NHANVIEN)
 * - Ví dụ: authorizeRole('GIÁM ĐỐC')
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // chỉ cho nhân viên (NHANVIEN) thực hiện
    if (!req.user || req.userType !== "NHANVIEN") {
      res.status(403);
      return next(new Error("Chỉ nhân viên mới được thực hiện thao tác này"));
    }

    // lấy role: ưu tiên req.userRole (từ token) hoặc từ DB req.user.chucVu
    const role = req.userRole || req.user.chucVu;
    if (!allowedRoles.includes(role)) {
      res.status(403);
      return next(new Error("Bạn không có quyền thực hiện hành động này"));
    }

    next();
  };
};
