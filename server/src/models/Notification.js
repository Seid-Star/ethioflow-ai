import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["low_stock", "overdue_credit", "sales_milestone"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: mongoose.Schema.Types.ObjectId, // product or customer, depending on type
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
