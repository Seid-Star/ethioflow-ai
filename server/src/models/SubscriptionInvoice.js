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

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "paid",
    },
    mode: { type: String, enum: ["demo", "live"], default: "demo" },
    providerMode: String,
    paymentMethod: String,

    reference: { type: String, required: true },
    txRef: String,
    providerReference: String,
    checkoutUrl: String,
    failureReason: String,

    paidAt: Date,
    periodStart: Date,
    periodEnd: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

invoiceSchema.index({ txRef: 1 }, { unique: true, sparse: true });

export default mongoose.model("SubscriptionInvoice", invoiceSchema);
