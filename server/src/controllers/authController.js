import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { normalizePhone } from "../utils/phone.js";
import { mailConfigured } from "../services/mailService.js";
import {
  hashToken,
  issueVerification,
  RESEND_COOLDOWN_MS,
} from "../services/emailVerificationService.js";

function shapeUser(user, businessId) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    businessId,
  };
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const { businessName, ownerName, password } = req.body;
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const rawPhone = String(req.body.phone || "").trim();

  let phone;
  if (rawPhone) {
    phone = normalizePhone(rawPhone);
    if (!phone) {
      res.status(400);
      throw new Error(
        "Enter a valid Ethiopian mobile number, for example 0911 234 567",
      );
    }
  }

  if (!email && !phone) {
    res.status(400);
    throw new Error("Enter an email address or a phone number");
  }

  const conditions = [];
  if (email) conditions.push({ email });
  if (phone) conditions.push({ phone });

  const existing = await User.findOne({ $or: conditions });
  if (existing) {
    res.status(409);
    throw new Error(
      email && existing.email === email
        ? "An account with this email already exists"
        : "An account with this phone number already exists",
    );
  }

  const business = await Business.create({
    name: businessName,
    branches: [{ name: "Main Branch", isMain: true }],
  });

  let user;
  try {
    user = await User.create({
      business: business._id,
      name: ownerName,
      email: email || undefined,
      phone,
      password,
      role: "owner",
      emailVerified: email ? false : undefined,
    });
  } catch (err) {
    await Business.deleteOne({ _id: business._id });
    if (err?.code === 11000) {
      res.status(409);
      throw new Error("An account with these details already exists");
    }
    throw err;
  }

  if (email) {
    let emailSent = false;
    try {
      const result = await issueVerification(user, req);
      emailSent = result.delivered;
    } catch (err) {
      console.error("Verification email failed:", err.message);
    }
    return res.status(201).json({
      needsVerification: true,
      email,
      emailSent,
      mailReady: mailConfigured(),
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user: shapeUser(user, business._id), accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier ?? req.body.email ?? "").trim();
  const { password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Enter your email or phone number and your password");
  }

  let query;
  if (identifier.includes("@")) {
    query = { email: identifier.toLowerCase() };
  } else {
    const phone = normalizePhone(identifier);
    if (!phone) {
      res.status(401);
      throw new Error("Invalid email, phone number or password");
    }
    query = { phone: { $in: [phone, `0${phone.slice(4)}`, phone.slice(1)] } };
  }

  const user = await User.findOne(query).select("+password +refreshToken");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email, phone number or password");
  }

  if (user.status !== "active") {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  if (user.emailVerified === false) {
    return res.status(403).json({
      message:
        "Please verify your email before logging in. We sent you a link when you signed up.",
      code: "EMAIL_NOT_VERIFIED",
      email: user.email,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);
  res.json({ user: shapeUser(user, user.business), accessToken });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.body?.token || "");

  if (!/^[a-f0-9]{64}$/.test(token)) {
    res.status(400);
    throw new Error("This verification link is not valid");
  }

  const user = await User.findOne({
    emailVerifyTokenHash: hashToken(token),
  }).select("+emailVerifyExpires");

  if (!user) {
    res.status(400);
    throw new Error(
      "This link is not valid, or a newer link replaced it. Request a new one.",
    );
  }

  if (user.emailVerified === true) {
    return res.json({ verified: true, already: true });
  }

  if (!user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    res.status(400);
    throw new Error("This link has expired. Request a new one.");
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerified: true, emailVerifiedAt: new Date() } },
  );
  res.json({ verified: true });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error("Enter your email address");
  }

  const user = await User.findOne({ email }).select("+emailVerifySentAt");

  if (user && user.emailVerified === false) {
    const sentAgo =
      Date.now() -
      (user.emailVerifySentAt ? user.emailVerifySentAt.getTime() : 0);
    if (sentAgo >= RESEND_COOLDOWN_MS) {
      try {
        await issueVerification(user, req);
      } catch (err) {
        console.error("Verification email failed:", err.message);
      }
    }
  }

  res.json({
    message:
      "If that email is waiting for verification, a new link is on its way.",
  });
});

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

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user: shapeUser(user, user.business) });
});
