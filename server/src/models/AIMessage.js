import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    intent: String,
    reply: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("AIMessage", aiMessageSchema);
