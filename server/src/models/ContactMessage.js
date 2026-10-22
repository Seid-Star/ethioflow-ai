import mongoose from "mongoose";

export const TOPICS = ["general", "demo", "pricing", "support", "partnership"];

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      set: (value) => (value ? String(value).trim().toLowerCase() : undefined),
    },
    phone: {
      type: String,
      trim: true,
      set: (value) => (value ? String(value).trim() : undefined),
    },
    topic: { type: String, enum: TOPICS, default: "general" },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    notified: { type: Boolean, default: false },
    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

export default mongoose.model("ContactMessage", contactMessageSchema);
