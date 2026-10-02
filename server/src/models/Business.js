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
    subscriptionPlan: {
      type: String,
      enum: ["free", "professional", "enterprise"],
      default: "free",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Business", businessSchema);
