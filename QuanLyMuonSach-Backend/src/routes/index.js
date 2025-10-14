import express from "express";
import docGiaRoutes from "./docGia.routes.js";
import nhanVienRoutes from "./nhanVien.routes.js";
import sachRoutes from "./sach.routes.js";
import nxbRoutes from "./nxb.route.js";
import theoDoiMuonSachRoutes from "./theoDoiMuonSach.routes.js";
const router = express.Router();

// Mọi route con bắt đầu bằng /docgia sẽ vào docGiaRoutes
router.use("/docgia",docGiaRoutes);
router.use("/nhanvien", nhanVienRoutes);
router.use("/sach", sachRoutes);
router.use("/nxb", nxbRoutes);
router.use("/theodoimuonsach",theoDoiMuonSachRoutes);
export default router;
// Có thể thêm các nhóm khác sau này
// router.use("/sach", sachRoutes);
// router.use("/muontra", muonTraRoutes);
