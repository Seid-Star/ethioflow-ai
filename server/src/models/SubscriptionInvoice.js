import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    plan: { type: String, required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ETB" },
    status: { type: String, default: "paid" },
    paymentMethod: { type: String, required: true },
    reference: { type: String, required: true },
    mode: { type: String, default: "demo" }, // no real payment gateway yet
    periodStart: Date,
    periodEnd: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
export default mongoose.model("SubscriptionInvoice", invoiceSchema);
