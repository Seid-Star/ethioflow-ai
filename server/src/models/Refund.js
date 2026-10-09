import mongoose from "mongoose";

const refundItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: { type: Number, required: true },
    unitPrice: Number,
    costPriceAtSale: Number,
    refundValue: Number,
  },
  { _id: false },
);

const refundSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    items: [refundItemSchema],
    amount: { type: Number, required: true },
    costReversed: { type: Number, default: 0 },
    reason: String,
    refundMethod: {
      type: String,
      enum: [
        "cash",
        "mobile_money",
        "bank_transfer",
        "card",
        "customer_credit",
      ],
      required: true,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Refund", refundSchema);
