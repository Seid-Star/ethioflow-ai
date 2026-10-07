import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: String,
    email: String,
    department: {
      type: String,
      enum: [
        "Sales",
        "Inventory",
        "Finance",
        "Management",
        "Operations",
        "Other",
      ],
      default: "Sales",
    },
    position: { type: String, default: "Staff" },
    branch: String,
    monthlySalary: { type: Number, default: 0, min: 0 },
    hireDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional: if this employee also has a login
  },
  { timestamps: true },
);

export default mongoose.model("Employee", employeeSchema);
