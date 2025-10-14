import express from "express";
import { protect, authorizeRole } from "../middlewares/nhanVien.middleware.js";
import {
  getTheoDoiMuonSachs,
  getTheoDoiMuonSachById,
  createTheoDoiMuonSach,
  updateTheoDoiMuonSach,
  deleteTheoDoiMuonSach,
} from "../controllers/theoDoiMuonSach.controller.js";

const router = express.Router();

router.get("/", getTheoDoiMuonSachs);
router.get("/:id", getTheoDoiMuonSachById);
router.post(
  "/",
  protect,
  authorizeRole("GIÁM ĐỐC", "NHÂN VIÊN"),
  createTheoDoiMuonSach
);
router.put(
  "/:id",
  protect,
  authorizeRole("GIÁM ĐỐC", "NHÂN VIÊN"),
  updateTheoDoiMuonSach
);
router.delete(
  "/:id",
  protect,
  authorizeRole("GIÁM ĐỐC", "NHÂN VIÊN"),
  deleteTheoDoiMuonSach
);
export default router;
