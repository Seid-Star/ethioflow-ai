import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["purchase", "payment"], required: true },
    amount: { type: Number, required: true },
    note: String,
    relatedSale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: String,
    address: String,
    totalPurchased: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    ledger: [ledgerEntrySchema],
  },
  { timestamps: true },
);

// Adds one ledger line and keeps the running totals in sync — this is the only
// place balances ever change, so the math can never drift out of step with the history.
customerSchema.methods.recordEntry = function ({
  type,
  amount,
  note,
  relatedSale,
}) {
  this.ledger.push({ type, amount, note, relatedSale, date: new Date() });
  if (type === "purchase") {
    this.totalPurchased += amount;
    this.outstandingBalance += amount;
  } else {
    this.totalPaid += amount;
    this.outstandingBalance -= amount;
  }
};

export default mongoose.model("Customer", customerSchema);
