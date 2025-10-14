import asyncHandler from "express-async-handler";
import NhaXuatBan from "../models/nhaXuatBan.js";

//GET /api/nxb - Lấy danh sách nhà xuất bản
export const getNXB = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query; // Lấy giá trị query từ URL
  const query = {};
  // Nếu có từ khóa search thì thêm điều kiện tìm kiếm
  if (search) {
    const re = new RegExp(search, "i");
    //query làm điều kiện tìm kiếm, chỉ tìm theo tên hoặc mã NXB
    query.$or = [{ tenNXB: re }, { maNXB: re }];
  }
  // Xác định giới hạn và trang (ép kiểu sang số và đảm bảo >=1)
  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;
  // Chạy song song 2 truy vấn: đếm tổng số bản ghi + lấy danh sách theo trang
  const [total, items] = await Promise.all([
    NhaXuatBan.countDocuments(query),
    NhaXuatBan.find(query)
      .skip(skip)
      .limit(perPage) // Giới hạn số kết quả trả về
      .sort({ createdAt: -1 }), // Sắp xếp theo ngày tạo mới nhất
  ]);
  res.json({
    success: true,
    data: items, // Trả dữ liệu về
    //Trả thông tin phân trang để làm view bên client
    meta: {
      total,
      page: Number(page),
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  });
});

//GET /api/nxb/:id - Lấy thông tin chi tiết 1 nhà xuất bản theo id
export const getNXBById = asyncHandler(async (req, res) => {
  const item = await NhaXuatBan.findById(req.params.id); // Tìm NXB theo ID
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhaXuatBan không tồn tại" }); // Nếu không có -> 404
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

//POST /api/nxb (admin) - Thêm mới nhà xuất bản
export const createNXB = asyncHandler(async (req, res) => {
  const { maNXB, tenNXB, diaChi } = req.body;
  if (!maNXB || !tenNXB) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }
  // Kiểm tra mã NXB đã tồn tại chưa
  const existingNXB = await NhaXuatBan.findOne({ maNXB });
  if (existingNXB)
    return res
      .status(400)
      .json({ success: false, message: "Mã NXB đã tồn tại" });
  const newNXB = new NhaXuatBan({ maNXB, tenNXB, diaChi });
  res.status(201).json({ success: true, data: await newNXB.save() });
});

//PUT /api/nxb/:id ( admin )- Cập nhật thông tin nhà xuất bản
export const updateNXB = asyncHandler(async (req, res) => {
  const item = await NhaXuatBan.findByIdAndUpdate(req.params.id, req.body, {new: true , runValidators: true}); // Tìm NXB theo ID
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhaXuatBan không tồn tại" });
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

//DELETE /api/nxb/:id ( admin )- Xoá nhà xuất bản
export const deleteNXB = asyncHandler(async (req, res) => {
  const item = await NhaXuatBan.findByIdAndDelete(req.params.id); // Tìm NXB theo ID
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "NhaXuatBan không tồn tại" });
  res.json({ success: true, message: "Xoá NhaXuatBan thành công" });
});
