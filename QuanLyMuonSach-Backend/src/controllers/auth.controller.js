// src/controllers/authController.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/nhanVien.js";

/* Helpers: sign tokens */
// access token ngắn (15 phút)
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// refresh token dài hơn (7 ngày) - dùng secret riêng nếu có
const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/**
 * POST /api/auth/login
 * - account: msnv (nhân viên) or maDocGia (độc giả) or email
 * - password
 * Trả: { success:true, data: { accessToken, user } } and sets httpOnly cookie refreshToken
 */
export const login = asyncHandler(async (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    res.status(400);
    throw new Error("Vui lòng cung cấp tài khoản và mật khẩu");
  }

  // tìm nhân viên theo msnv hoặc email
  let user = await NhanVien.findOne({
    $or: [{ msnv: account }, { email: account }],
  });
  let userType = "NHANVIEN";

  // nếu không phải nhân viên -> tìm độc giả theo maDocGia hoặc email
  if (!user) {
    user = await DocGia.findOne({
      $or: [{ maDocGia: account }, { email: account }],
    });
    userType = "DOCGIA";
  }

  if (!user) {
    res.status(401);
    throw new Error("Tài khoản không tồn tại");
  }

  const match = await bcrypt.compare(password, user.password || "");
  if (!match) {
    res.status(401);
    throw new Error("Sai mật khẩu");
  }

  // payload chứa id, type và role (nếu có)
  const payload = {
    id: user._id,
    type: userType,
    role: user.chucVu || user.role || null,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // ensure refreshTokens is array, push new token, keep last 10 tokens
  user.refreshTokens = Array.isArray(user.refreshTokens)
    ? user.refreshTokens
    : [];
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > 10) {
    user.refreshTokens = user.refreshTokens.slice(-10);
  }
  await user.save();

  // set httpOnly cookie for refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // prepare safe user object (omit sensitive fields)
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshTokens;

  res.json({
    success: true,
    data: {
      accessToken,
      user: safeUser,
    },
  });
});

/**
 * POST /api/auth/refresh
 * - đọc cookie refreshToken
 * - verify, check token exists in user's refreshTokens, rotate (replace) token
 * - trả accessToken mới (và set cookie refreshToken mới)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("Không có refresh token");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    const { id, type } = decoded;

    const Model = type === "DOCGIA" ? DocGia : NhanVien;
    const user = await Model.findById(id);
    if (
      !user ||
      !Array.isArray(user.refreshTokens) ||
      !user.refreshTokens.includes(token)
    ) {
      res.status(401);
      throw new Error("Refresh token không hợp lệ");
    }

    const newPayload = {
      id: user._id,
      type,
      role: user.chucVu || user.role || null,
    };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // rotate: remove old token, push new, prune to last 10
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    if (user.refreshTokens.length > 10)
      user.refreshTokens = user.refreshTokens.slice(-10);
    await user.save();

    // set cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    // nếu token expired or invalid -> clear cookie and reject
    res.clearCookie("refreshToken");
    res.status(401);
    throw new Error("Refresh token không hợp lệ hoặc hết hạn");
  }
});

/**
 * POST /api/auth/logout
 * - xóa refresh token hiện tại khỏi DB (nếu có)
 * - clear cookie
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
      const Model = decoded.type === "DOCGIA" ? DocGia : NhanVien;
      const user = await Model.findById(decoded.id);
      if (user && Array.isArray(user.refreshTokens)) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
      }
    } catch (e) {
      // ignore errors — still clear cookie
    }
  }
  res.clearCookie("refreshToken");
  res.json({ success: true, data: "Logged out" });
});

/**
 * Optional: register endpoints (kept minimal)
 * - registerDocGia: expects maDocGia, hoLot, ten, email?, password
 * - registerStaff: expects msnv, hoTenNV, email, password, chucVu
 */
export const registerDocGia = asyncHandler(async (req, res) => {
  const { maDocGia, hoLot, ten, email, password } = req.body;
  if (!maDocGia || !hoLot || !ten || !password) {
    res.status(400);
    throw new Error("Thiếu thông tin đăng ký (maDocGia, hoLot, ten, password)");
  }
  const existing = await DocGia.findOne({ $or: [{ maDocGia }, { email }] });
  if (existing) {
    res.status(400);
    throw new Error("maDocGia hoặc email đã tồn tại");
  }
  const hashed = await bcrypt.hash(password, 10);
  const newUser = await DocGia.create({
    maDocGia,
    hoLot,
    ten,
    email,
    password: hashed,
  });
  const safeUser = newUser.toObject();
  delete safeUser.password;
  res.status(201).json({ success: true, data: safeUser });
});

export const registerStaff = asyncHandler(async (req, res) => {
  const { msnv, hoTenNV, email, password, chucVu } = req.body;
  if (!msnv || !hoTenNV || !email || !password || !chucVu) {
    res.status(400);
    throw new Error("Thiếu thông tin đăng ký");
  }
  const existing = await NhanVien.findOne({ $or: [{ msnv }, { email }] });
  if (existing) {
    res.status(400);
    throw new Error("MSNV hoặc email đã tồn tại");
  }
  const hashed = await bcrypt.hash(password, 10);
  const newStaff = await NhanVien.create({
    msnv,
    hoTenNV,
    email,
    password: hashed,
    chucVu,
  });
  const safeUser = newStaff.toObject();
  delete safeUser.password;
  res.status(201).json({ success: true, data: safeUser });
});
