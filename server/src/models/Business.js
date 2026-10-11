import mongoose from "mongoose";
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  isMain: { type: Boolean, default: false },
});

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "General Merchant" },
    phone: String,
    address: String,
    currency: { type: String, default: "ETB" },
    taxRate: { type: Number, default: 0 },
    branches: [branchSchema],

    // Subscription (status is left empty on old accounts; the first read starts their trial)
    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "professional", "enterprise"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["trialing", "active", "canceled", "expired"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    trialEndsAt: Date,
    currentPeriodEnd: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Business", businessSchema);
