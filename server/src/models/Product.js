import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true, index: true },
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, // wired up on Day 13
    costPrice: { type: Number, required: true, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, default: 0, min: 0 },
    currentStock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "pcs" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
