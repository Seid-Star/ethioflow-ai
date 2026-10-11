import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    action: { type: String, required: true }, // e.g. "sale.create"
    entityType: String,
    entityId: String,
    summary: { type: String, required: true },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ business: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
