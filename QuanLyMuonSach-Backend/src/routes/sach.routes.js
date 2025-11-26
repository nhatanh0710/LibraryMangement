import express from "express";
import multer from "multer";
import {
  getSachs,
  getSachById,
  createSach,
  updateSach,
  deleteSach,
} from "../controllers/sach.controller.js";

// Cấu hình upload file
const upload = multer({ dest: "uploads/" }); // lưu file tạm vào folder "uploads"

const router = express.Router();

// GET danh sách
router.get("/", getSachs);
router.get("/:id", getSachById);

// POST CREATE sách: multer parse FormData
// 'hinhAnh' là tên field file trên FormData
router.post("/", upload.single("hinhAnh"), createSach);

// PUT UPDATE sách (có thể kèm file)
router.put("/:id", upload.single("hinhAnh"), updateSach);

// DELETE
router.delete("/:id", deleteSach);

export default router;
