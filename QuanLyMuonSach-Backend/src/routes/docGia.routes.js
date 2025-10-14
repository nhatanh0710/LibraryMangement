// src/routes/docGia.routes.js
import express from "express";
import {
  registerDocGia,
  loginDocGia,
  getDocGias,
  getDocGiaById,
  createDocGia,
  updateDocGia,
  deleteDocGia,
} from "../controllers/DocGia.controller.js";
import { protect } from "../middlewares/nhanVien.middleware.js";
const router = express.Router();

router.post("/register", registerDocGia);
router.post("/login", loginDocGia);
router.get("/", protect, getDocGias);
router.post("/", protect, createDocGia);
router.get("/:id", protect, getDocGiaById);
router.put("/:id", protect, updateDocGia);
router.delete("/:id", protect, deleteDocGia);

export default router;
