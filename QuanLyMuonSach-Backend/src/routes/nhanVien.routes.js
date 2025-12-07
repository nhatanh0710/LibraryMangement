import express from "express";
import {
  registerNhanVien,
  loginNhanVien,
  getNhanViens,
  getNhanVienById,
  updateNhanVien,
  deleteNhanVien,
  softDeleteNhanVien,
} from "../controllers/nhanVien.controller.js";
import { protect, authorizeRole } from "../middlewares/nhanVien.middleware.js";

const router = express.Router();
router.post("/", protect, authorizeRole("GIÁM ĐỐC"), registerNhanVien);
router.post("/login", loginNhanVien);
router.get("/", getNhanViens);
router.get("/:id", getNhanVienById);
router.put("/:id", protect, authorizeRole("GIÁM ĐỐC"), updateNhanVien);
router.put(
  "/soft-delete/:id",
  protect,
  authorizeRole("GIÁM ĐỐC"),
  softDeleteNhanVien
);
router.delete("/:id", protect, authorizeRole("GIÁM ĐỐC"), deleteNhanVien);
export default router;
