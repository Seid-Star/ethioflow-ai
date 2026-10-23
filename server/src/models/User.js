import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { normalizePhone } from "../utils/phone.js";

const userSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    branch: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      set: (value) => (value ? String(value).trim().toLowerCase() : undefined),
    },
    phone: {
      type: String,
      trim: true,
      set: (value) =>
        value ? normalizePhone(value) || String(value).trim() : undefined,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "owner", "manager", "cashier", "accountant"],
      default: "owner",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    refreshToken: { type: String, select: false },
    isPlatformAdmin: { type: Boolean, default: false },
    emailVerified: { type: Boolean },
    emailVerifiedAt: Date,
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    emailVerifySentAt: { type: Date, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetSentAt: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } },
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } },
);

userSchema.pre("validate", async function () {
  if (!this.email && !this.phone)
    this.invalidate("email", "Provide an email address or a phone number");
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
