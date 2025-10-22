import asyncHandler from "express-async-handler";
import TheoDoiMuonSach from "../models/theoDoiMuonSach.js";
import DocGia from "../models/DocGia.js";
import Sach from "../models/sach.js";

// GET /api/theodoimuonsach - Lấy danh sách theo dõi mượn sách (có hỗ trợ tìm kiếm và phân trang)
export const getTheoDoiMuonSachs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query; // Lấy giá trị query từ URL
  const query = {};
  // Nếu có từ khóa search thì thêm điều kiện tìm kiếm
  if (search) {
    const re = new RegExp(search, "i"); // "i" = không phân biệt hoa thường
    query.$or = [{ maDocGia: re }, { maSach: re }]; // Tìm theo mã độc giả hoặc mã sách
  }
  // Xác định giới hạn và trang (ép kiểu sang số và đảm bảo >=1)
  const perPage = Math.max(1, Number(limit));
  const skip = (Math.max(1, Number(page)) - 1) * perPage;
  const [total, items] = await Promise.all([
    TheoDoiMuonSach.countDocuments(query),
    TheoDoiMuonSach.find(query)
      .populate("maDocGia", "maDocGia ten hoLot")
      .populate("maSach", "maSach tenSach tacGia")
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

// GET /api/theodoimuonsach/:id - Lấy thông tin chi tiết 1 theo dõi mượn sách theo id
export const getTheoDoiMuonSachById = asyncHandler(async (req, res) => {
  const item = await TheoDoiMuonSach.findById(req.params.id);
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "TheoDoiMuonSach không tồn tại" });
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

// POST /api/theodoimuonsach - Thêm mới theo dõi mượn sách
export const createTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const { maDocGia, maSach, ngayMuon, ngayDuKienTra, ngayTra, trangThai } =
    req.body;
  if (!maDocGia || !maSach || !ngayMuon || !ngayDuKienTra || !trangThai) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });
  }
  // Kiểm tra mã độc giả đã tồn tại chưa
  const existingDocGia = await DocGia.findById(maDocGia);
  if (!existingDocGia)
    return res
      .status(400)
      .json({ success: false, message: "Mã độc giả đã tồn tại" });
  const newTheoDoiMuonSach = new TheoDoiMuonSach({
    maDocGia,
    maSach,
    ngayMuon,
    ngayDuKienTra,
    ngayTra,
    trangThai,
  });
  await newTheoDoiMuonSach.save();
  // populate ngay trước khi trả
  const populated = await TheoDoiMuonSach.findById(newTheoDoiMuonSach._id)
    .populate("maDocGia", "hoLot ten maDocGia")
    .populate("maSach", "tenSach maSach tacGia");
  res.status(201).json({ success: true, data: populated });
});

// PUT /api/theodoimuonsach/:id - Cập nhật thông tin theo dõi mượn sách
export const updateTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const item = await TheoDoiMuonSach.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ); // Tìm theo ID và cập nhật
  if (!item)
    return res
      .status(404)
      .json({ success: false, message: "TheoDoiMuonSach không tồn tại" });
  res.json({ success: true, data: item }); // Nếu có -> trả dữ liệu
});

// DELETE /api/theodoimuonsach/:id - Xoá theo dõi mượn sách
export const deleteTheoDoiMuonSach = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "ID không hợp lệ" });
  }

  const theoDoi = await TheoDoiMuonSach.findById(id);
  if (!theoDoi) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phiếu mượn" });
  }
  // Nếu là ĐỘC GIẢ
  if (req.userType === "DOCGIA") {
    // chỉ xóa phiếu của chính họ
    if (theoDoi.maDocGia.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền xóa phiếu này" });
    }
    // chỉ cho xóa khi trạng thái là CHỜ DUYỆT
    if (theoDoi.trangThai !== "CHỜ DUYỆT") {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể xóa khi phiếu ở trạng thái 'CHỜ DUYỆT'",
      });
    }
  }

  // Nếu là NHÂN VIÊN
  else if (req.userType === "NHANVIEN") {
    // chỉ cho xóa khi trạng thái là ĐÃ TRẢ
    if (theoDoi.trangThai !== "ĐÃ TRẢ") {
      return res.status(400).json({
        success: false,
        message: "Nhân viên chỉ được xóa khi phiếu ở trạng thái 'ĐÃ TRẢ'",
      });
    }
  }

  // Các loại người dùng khác thì cấm xóa
  else {
    return res
      .status(403)
      .json({ success: false, message: "Không có quyền thực hiện" });
  }
  // Xóa phiếu mượn
  await TheoDoiMuonSach.findByIdAndDelete(id);
  res.json({ success: true, message: "Xóa phiếu mượn thành công" });
});
