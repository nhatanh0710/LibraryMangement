import asyncHandler from "express-async-handler"; // Giúp xử lý lỗi bất đồng bộ mà không cần try/catch
import NhanVien from "../models/nhanVien.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//GET /api/nhanvien - Lấy danh sách nhân viên (có hỗ trợ tìm kiếm và phân trang)
export const getNhanViens = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query; // Lấy giá trị query từ URL
  const query = {};
  // Nếu có từ khóa search thì thêm điều kiện tìm kiếm
  if (search) {
    const re = new RegExp(search, "i"); // "i" = không phân biệt hoa thường
    query.$or = [{ hoTenNV: re }, { msnv: re }, { chucVu: re }]; // Tìm theo họ tên, mã nhân viên hoặc chức vụ
  }
  // Xác định giới hạn và trang (ép kiểu sang số và đảm bảo >=1)
  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;
  // Chạy song song 2 truy vấn: đếm tổng số bản ghi + lấy danh sách theo trang
  const [total, items] = await Promise.all([
    NhanVien.countDocuments(query),
    NhanVien.find(query)
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

//GET /api/nhanvien/:id - Lấy thông tin chi tiết 1 nhân viên theo id
export const getNhanVienById = asyncHandler(async (req, res) => {
  const item = await NhanVien.findById(req.params.id); // Tìm nhân viên theo ID
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhanVien không tồn tại" });
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

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
    msnv,
    hoTenNV,
    password: hashedPassword,
    chucVu,
    diaChi,
    soDienThoai,
  });
  res.status(201).json({ success: true, data: newNV });
});

//POST /api/nhanvien/login - Đăng nhập nhân viên
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

//PUT /api/nhanvien/:id - Cập nhật thông tin nhân viên
export const updateNhanVien = asyncHandler(async (req, res) => {
  const item = await NhanVien.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Trả về bản ghi sau khi cập nhật
    runValidators: true, // Kiểm tra dữ liệu theo schema trước khi lưu
  });
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhanVien không tồn tại" });
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

//DELETE /api/nhanvien/:id - Xoá nhân viên mềm (Chỉ thay đổi trạng thái thành BLOCKED)\
export const softDeleteNhanVien = asyncHandler(async (req, res) => {
  const item = await NhanVien.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhanVien không tồn tại" });
  item.trangThai = "BLOCKED";
  await item.save();
  res.json({ success: true, message: "Khóa NhanVien thành công" });
});

//DELETE /api/nhanvien/:id - Xoá nhân viên
//Chỉ xóa khi nhân viên không có liên quan đến nghiệp vụ khác
export const deleteNhanVien = asyncHandler(async (req, res) => {
  const item = await NhanVien.findByIdAndDelete(req.params.id); // Tìm nhân viên theo ID
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhanVien không tồn tại" });
  res.json({ success: true, message: "Xoá NhanVien thành công" });
});
