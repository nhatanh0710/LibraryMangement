import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import NhanVien from "../models/nhanVien.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Chưa đăng nhập" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await NhanVien.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    req.user = user; // đặt tên phổ biến là req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// Middleware chỉ cho phép nhân viên quản lý
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.chucVu === "ADMIN") return next();
  return res.status(403).json({ message: "Không có quyền truy cập" });
};
