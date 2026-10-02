import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Rent",
        "Electricity",
        "Salary",
        "Transport",
        "Internet",
        "Maintenance",
        "Other",
      ],
    },
    amount: { type: Number, required: true, min: 0.01 },
    note: String,
    date: { type: Date, default: Date.now },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
