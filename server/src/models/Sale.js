import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    costPriceAtSale: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const paymentLineSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "mobile_money",
        "card",
        "customer_credit",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payments: { type: [paymentLineSchema], required: true },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "mobile_money",
        "card",
        "split",
        "customer_credit",
      ],
      required: true,
    },
    amountPaid: { type: Number, required: true },

    // --- Offline sync tracking ---
    isOfflineSale: { type: Boolean, default: false },
    offlineTransactionId: { type: String }, // set only for sales created via the sync endpoint
    syncedAt: Date,
    hasStockConflict: { type: Boolean, default: false }, // true if syncing this sale pushed stock below 0
  },
  { timestamps: true },
);

// Prevents the exact same offline sale from ever being saved twice, even if sync
// runs more than once (flaky connection, double-tap, retried request) — but only
// applies to documents that actually have an offlineTransactionId.
saleSchema.index(
  { business: 1, offlineTransactionId: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model("Sale", saleSchema);
