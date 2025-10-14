// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/nhanVien.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    res.status(401);
    throw new Error("Không có token, vui lòng đăng nhập");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // token có thể chứa { id, type } — type: 'DOCGIA' hoặc 'NHANVIEN'
    if (decoded.type === "DOCGIA") {
      req.user = await DocGia.findById(decoded.id).select("-password");
      req.userType = "DOCGIA";
    } else {
      req.user = await NhanVien.findById(decoded.id).select("-password");
      req.userType = "NHANVIEN";
    }
    if (!req.user) {
      res.status(401);
      throw new Error("Người dùng không tồn tại");
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Token không hợp lệ hoặc hết hạn");
  }
});

// authorizeRole dùng cho NhanVien (ví dụ: chỉ GIÁM ĐỐC mới xóa)
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // chỉ áp dụng khi user là NhanVien
    if (!req.user || req.userType !== "NHANVIEN") {
      res.status(403);
      return next(new Error("Chỉ nhân viên mới được thực hiện thao tác này"));
    }
    const role = req.user.chucVu; // 'NHÂN VIÊN'|| 'GIÁM ĐỐC'
    if (!allowedRoles.includes(role)) {
      res.status(403);
      return next(new Error("Bạn không có quyền thực hiện hành động này"));
    }
    next();
  };
};
