import mongoose from "mongoose";

export const TOPIC_LABELS = {
  general: "General question",
  demo: "Request a demo",
  pricing: "Pricing and plans",
  support: "Technical help",
  partnership: "Partnership",
};

export const TOPICS = Object.keys(TOPIC_LABELS);

const replySchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    sentTo: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

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
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    notified: { type: Boolean, default: false },
    acknowledgedAt: Date,
    repliedAt: Date,
    replies: [replySchema],
    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, acknowledgedAt: 1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
