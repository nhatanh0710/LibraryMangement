import express from "express";
import { protect, authorizeAdmin } from "../middleware/nhanVien.middleware.js";
import {
  getTheoDoiMuonSachs,
  getTheoDoiMuonSachById,
  createTheoDoiMuonSach,
  updateTheoDoiMuonSach,
  deleteTheoDoiMuonSach,
} from "../controllers/theoDoiMuonSach.controller.js";

const router = express.Router();

router.use("/", protect, getTheoDoiMuonSachs);
router.use("/:id", protect, getTheoDoiMuonSachById);
router.use("/", protect, authorizeAdmin, createTheoDoiMuonSach);
router.use("/:id", protect, authorizeAdmin, updateTheoDoiMuonSach);
router.use("/:id", protect, authorizeAdmin, deleteTheoDoiMuonSach);
export default router;
