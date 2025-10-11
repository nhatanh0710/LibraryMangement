import asyncHandler from "express-async-handler"; // Giúp xử lý lỗi bất đồng bộ mà không cần try/catch
import NhanVien from "../models/nhanVien.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//POST /api/nhanvien/register
export const registerNhanVien = asyncHandler(async (req, res) => {
  const { msnv, hoTenNV, password, chucVu, diaChi, soDienThoai } = req.body;
  if (!msnv || !hoTenNV || !password || !chucVu || !diaChi || !soDienThoai)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

  // Kiểm tra mã nhân viên có bị trùng không
  const exists = await NhanVien.findOne({ msnv });
  if (exists)
    return res
      .status(409)
      .json({ success: false, message: "Mã nhân viên đã tồn tại" });

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Tạo mới nhân viên
  const newNV = await NhanVien.create({
    mvnv,
    hoTenNV,
    password: hashedPassword,
    chucVu,
    diaChi,
    soDienThoai,
  });
  res.status(201).json({ success: true, data: newNV });
});

//POST /api/nhanvien/login
export const loginNhanVien = asyncHandler(async (req, res) => {
  // Lấy thông tin đăng nhập
  const { msnv, password } = req.body;

  if (!msnv || !password)
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });

  // Tìm nhân viên theo mã nhân viên
  const nv = await NhanVien.findOne({ msnv });
  if (!nv)
    return res
      .status(404)
      .json({ success: false, message: "Mã nhân viên không tồn tại" });
  // Kiểm tra mật khẩu
  const isPasswordMatch = await bcrypt.compare(password, nv.password);
  if (!isPasswordMatch)
    return res
      .status(401)
      .json({ success: false, message: "Mật khẩu không đúng" });
  // Tạo token
  const token = jwt.sign(
    { id: nv._id, msnv: nv.msnv, chucVu: nv.chucVu },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    data: {
      token,
      id: nv._id,
      msnv: nv.msnv,
      hoTenNV: nv.hoTenNV,
      chucVu: nv.chucVu,
    },
  });
});
