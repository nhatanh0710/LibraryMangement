📚 Hệ Thống Quản Lý Mượn Sách

Backend API + Database Design

Dự án Quản Lý Mượn Sách cung cấp API phục vụ cho thư viện nhằm quản lý độc giả, sách, nhà xuất bản, nhân viên và quá trình mượn–trả sách.
Hệ thống được xây dựng với mục tiêu dễ dùng – dễ mở rộng – dễ tích hợp.

🚀 Công Nghệ Sử Dụng

Node.js + Express.js – Backend REST API

MongoDB + Mongoose – Lưu trữ dữ liệu

JWT – Xác thực người dùng (nếu có module auth)

BCrypt – Mã hóa mật khẩu nhân viên

Express-Async-Handler – Xử lý lỗi async

Npm / Yarn – Quản lý package

🛠 Chức Năng Chính
✔ Quản lý Độc giả (DocGia)

Tạo – xem – sửa – xóa độc giả

Tìm kiếm theo mã, tên, số điện thoại

✔ Quản lý Sách (Sach)

Thêm mới sách theo mã sách

Cập nhật số lượng, đơn giá

Lọc theo nhà xuất bản, năm xuất bản

✔ Quản lý Nhà xuất bản (NhaXuatBan)

Thêm mới – chỉnh sửa – xóa

Liên kết với sách thông qua MaNXB

✔ Quản lý Nhân viên (NhanVien)

Đăng ký / đăng nhập (tùy module)

Mã hóa mật khẩu

Quyền hạn (chức vụ)

✔ Theo dõi mượn sách (TheoDoiMuonSach)

Ghi nhận độc giả nào mượn sách nào

Ngày mượn – ngày trả

Xử lý trường hợp trả muộn, chưa trả

🗂 Cấu Trúc Database (theo tài liệu gốc)

Quanlymuonsach

1. DocGia
Trường	Mô tả
MaDocGia	Mã độc giả
HoLot	Họ lót
Ten	Tên
NgaySinh	Ngày sinh
Phai	Giới tính
DiaChi	Địa chỉ
DienThoai	SĐT
2. Sach
Trường	Mô tả
MaSach	Mã sách
TenSach	Tên sách
DonGia	Giá bán / ghi mượn
SoQuyen	Số lượng còn lại
NamXuatBan	Năm xuất bản
MaNXB	Liên kết với nhà xuất bản
TacGia / NguonGoc	Tác giả hoặc nguồn gốc
3. NhaXuatBan
Trường	Mô tả
MaNXB	Mã NXB
TenNXB	Tên NXB
DiaChi	Địa chỉ
4. TheoDoiMuonSach
Trường	Mô tả
MaDocGia	Ai mượn
MaSach	Mượn sách nào
NgayMuon	Ngày mượn
NgayTra	Ngày trả (có thể null nếu chưa trả)
5. NhanVien
Trường	Mô tả
MSNV	Mã số nhân viên
HoTenNV	Tên nhân viên
Password	Mật khẩu (đã mã hóa)
ChucVu	Chức vụ
DiaChi	Địa chỉ
SoDienThoai	SĐT
📁 Cấu trúc thư mục backend (gợi ý)
/src
 ├── controllers
 ├── routes
 ├── models
 ├── middleware
 ├── config
 ├── utils
 └── server.js

🔧 Cài Đặt & Chạy Dự Án
1️⃣ Clone dự án
git clone <repository-url>
cd QuanLyMuonSach

2️⃣ Cài đặt package
npm install

3️⃣ Tạo file môi trường .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/QuanLyMuonSach
JWT_SECRET=your_secret_key

4️⃣ Chạy server
npm run dev
