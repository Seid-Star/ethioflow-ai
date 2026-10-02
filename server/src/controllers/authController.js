import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

function shapeUser(user, businessId) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId,
  };
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /api/auth/register — creates a Business AND its first Owner user together
export const register = asyncHandler(async (req, res) => {
  const { businessName, ownerName, email, phone, password } = req.body;

  if (!businessName || !ownerName || !email || !password) {
    res.status(400);
    throw new Error("businessName, ownerName, email and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const business = await Business.create({
    name: businessName,
    branches: [{ name: "Main Branch", isMain: true }],
  });

  const user = await User.create({
    business: business._id,
    name: ownerName,
    email,
    phone,
    password,
    role: "owner",
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user: shapeUser(user, business._id), accessToken });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select(
    "+password +refreshToken",
  );

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.json({ user: shapeUser(user, user.business), accessToken });
});

// POST /api/auth/refresh — uses the httpOnly cookie to issue a new access token
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error("Refresh token does not match");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  user.refreshToken = newRefreshToken;
  await user.save();

  setRefreshCookie(res, newRefreshToken);
  res.json({ accessToken });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await User.updateOne(
      { refreshToken: token },
      { $unset: { refreshToken: 1 } },
    );
  }
  res.clearCookie("refreshToken");
  res.status(204).send();
});

// GET /api/auth/me — used by the frontend to check "am I still logged in?"
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user: shapeUser(user, user.business) });
});
