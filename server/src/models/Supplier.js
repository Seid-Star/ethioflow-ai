import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["purchase", "payment"], required: true },
    amount: { type: Number, required: true },
    note: String,
    relatedPurchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const supplierSchema = new mongoose.Schema(
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
    totalPurchased: { type: Number, default: 0 }, // total you've ordered from them, all time
    totalPaid: { type: Number, default: 0 }, // total you've paid them, all time
    outstandingBalance: { type: Number, default: 0 }, // what you still owe them
    ledger: [ledgerEntrySchema],
  },
  { timestamps: true },
);

supplierSchema.methods.recordEntry = function ({
  type,
  amount,
  note,
  relatedPurchase,
}) {
  this.ledger.push({ type, amount, note, relatedPurchase, date: new Date() });
  if (type === "purchase") {
    this.totalPurchased += amount;
    this.outstandingBalance += amount;
  } else {
    this.totalPaid += amount;
    this.outstandingBalance -= amount;
  }
};

export default mongoose.model("Supplier", supplierSchema);
