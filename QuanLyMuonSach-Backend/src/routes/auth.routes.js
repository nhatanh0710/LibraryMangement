import express from "express";
import {
  login,
  refreshToken,
  logout,
  registerDocGia,

} from "../controllers/auth.controller.js";

const router = express.Router();

// đăng nhập / refresh / logout
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// đăng ký
router.post("/register", registerDocGia);
// router.post("/register-staff", registerStaff);

export default router;
