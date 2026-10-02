import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "owner", "manager", "cashier", "accountant"],
      default: "owner",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

// Hash the password automatically before saving, only if it changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// Compare a plain-text password against the stored hash
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
