import express from "express";
import { protect, authorizeAdmin } from "../middleware/nhanVien.middleware.js";
import {
  getNXB,
  getNXBById,
  createNXB,
  updateNXB,
  deleteNXB,
} from "../controllers/nxb.controller.js";

const router = express.Router();

// Mọi route con bắt đầu bằng /nxb sẽ vào nxbRoutes

router.use("/", protect, getNXB);
router.use("/:id", protect, getNXBById);
router.use("/", protect, authorizeAdmin, createNXB);
router.use("/:id", protect, authorizeAdmin, updateNXB);
router.use("/:id", protect, authorizeAdmin, deleteNXB);

export default router;
