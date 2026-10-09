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

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

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
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    ledger: [ledgerEntrySchema],
    notes: [noteSchema],
  },
  { timestamps: true },
);

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
