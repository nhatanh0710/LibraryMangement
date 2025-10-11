import express from "express";
import {
  registerNhanVien,
  loginNhanVien,
} from "../controllers/nhanVien.controller.js";


const router = express.Router();
router.post("/register", registerNhanVien);
router.post("/login", loginNhanVien);

export default router;