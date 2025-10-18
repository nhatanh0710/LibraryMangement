// src/controllers/authController.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/nhanVien.js";

// helper: sign access token (short lived) and optionally refresh token (longer)
const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};
const signRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { account, password } = req.body; // account = msnv or email (or msdg for docgia)
  if (!account || !password) {
    res.status(400);
    throw new Error("Vui lòng cung cấp tài khoản và mật khẩu");
  }

  // Try find staff by msnv or email
  let user = await NhanVien.findOne({
    $or: [{ msnv: account }, { email: account }],
  });
  let userType = "NHANVIEN";
  if (!user) {
    // try DocGia
    user = await DocGia.findOne({
      $or: [{ msv: account }, { email: account }],
    });
    userType = "DOCGIA";
  }

  if (!user) {
    res.status(401);
    throw new Error("Tài khoản không tồn tại");
  }

  // compare password: make sure password stored hashed
  const match = await bcrypt.compare(password, user.password || "");
  if (!match) {
    res.status(401);
    throw new Error("Sai mật khẩu");
  }

  // payload: id + type for protect middleware
  const payload = { id: user._id, type: userType };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Save refresh token to user doc (so we can revoke). Use array for multiple devices.
  user.refreshTokens = Array.isArray(user.refreshTokens)
    ? user.refreshTokens
    : [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  // set httpOnly cookie for refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // send access token and user profile (omit password)
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

// POST /api/auth/refresh
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

    // find user
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

    // sign new tokens
    const newPayload = { id: user._id, type };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // replace refresh token in DB (or append and prune)
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
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
    res.clearCookie("refreshToken");
    res.status(401);
    throw new Error("Refresh token không hợp lệ hoặc hết hạn");
  }
});

// POST /api/auth/register-docgia
export const registerDocGia = asyncHandler(async (req, res) => {
  const { msv, hoTen, email, password } = req.body;
  if (!msv || !hoTen || !email || !password) {
    res.status(400);
    throw new Error('Thiếu thông tin đăng ký');
  }

  const existing = await DocGia.findOne({ $or: [{ msv }, { email }] });
  if (existing) {
    res.status(400);
    throw new Error('Mã số hoặc email đã tồn tại');
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await DocGia.create({ msv, hoTen, email, password: hashed });
  const safeUser = newUser.toObject();
  delete safeUser.password;
  res.status(201).json({ success: true, data: safeUser });
});

// POST /api/auth/register-staff
export const registerStaff = asyncHandler(async (req, res) => {
  const { msnv, hoTenNV, email, password, chucVu } = req.body;
  if (!msnv || !hoTenNV || !email || !password || !chucVu) {
    res.status(400);
    throw new Error('Thiếu thông tin đăng ký');
  }

  const existing = await NhanVien.findOne({ $or: [{ msnv }, { email }] });
  if (existing) {
    res.status(400);
    throw new Error('MSNV hoặc email đã tồn tại');
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

// POST /api/auth/logout
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
      // ignore
    }
  }
  res.clearCookie("refreshToken");
  res.json({ success: true, data: "Logged out" });
});
