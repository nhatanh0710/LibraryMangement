// src/routes/docGia.routes.js
import express from "express";
import {
  getDocGias,
  getDocGiaById,
  createDocGia,
  updateDocGia,
  deleteDocGia,
} from "../controllers/DocGia.controller.js";

const router = express.Router();

router.get("/", getDocGias);
router.post("/", createDocGia);
router.get("/:id", getDocGiaById);
router.put("/:id", updateDocGia);
router.delete("/:id", deleteDocGia);

export default router;
