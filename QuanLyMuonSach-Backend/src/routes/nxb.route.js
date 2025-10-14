import express from "express";
import { protect, authorizeRole } from "../middlewares/nhanVien.middleware.js";
import {
  getNXB,
  getNXBById,
  createNXB,
  updateNXB,
  deleteNXB,
} from "../controllers/nxb.controller.js";

const router = express.Router();

router.get("/", getNXB);
router.get("/:id", getNXBById);
router.post("/", protect, createNXB);
router.put("/:id", protect, updateNXB);
router.delete("/:id", protect, authorizeRole("GIÁM ĐỐC"), deleteNXB);

export default router;
