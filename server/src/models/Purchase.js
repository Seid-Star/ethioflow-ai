import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: { type: Number, required: true },
    costPrice: { type: Number, required: true }, // cost per unit at time of purchase
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const purchaseSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [purchaseItemSchema],
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: String,
  },
  { timestamps: true },
);

export default mongoose.model("Purchase", purchaseSchema);
