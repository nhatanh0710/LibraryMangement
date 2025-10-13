import express from "express";
import { protect, authorizeAdmin } from "../middleware/nhanVien.middleware.js";
import docGiaRoutes from "./docGia.routes.js";
import nhanVienRoutes from "./nhanVien.routes.js";
import sachRoutes from "./sach.routes.js";
import nxbRoutes from "./nxb.route.js";
const router = express.Router();

// Mọi route con bắt đầu bằng /docgia sẽ vào docGiaRoutes
router.use("/docgia", protect, docGiaRoutes);
router.use("/nhanvien", nhanVienRoutes);
router.use("/sach", sachRoutes);
router.use("/nxb", nxbRoutes);
export default router;
// Có thể thêm các nhóm khác sau này
// router.use("/sach", sachRoutes);
// router.use("/muontra", muonTraRoutes);
