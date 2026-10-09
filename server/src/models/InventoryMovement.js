import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["sale", "stock_in", "adjustment", "transfer", "refund"],
      required: true,
    },
    previousStock: { type: Number, required: true },
    change: { type: Number, required: true }, // negative for decreases, positive for increases
    newStock: { type: Number, required: true },
    reason: String, // e.g. "Damaged in storage", "Supplier delivery", "POS sale"
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("InventoryMovement", inventoryMovementSchema);
