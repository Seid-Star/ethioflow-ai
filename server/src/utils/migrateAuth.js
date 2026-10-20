import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { normalizePhone } from "./phone.js";

async function run() {
  await connectDB();

  const users = await User.collection
    .find({ phone: { $exists: true } })
    .sort({ createdAt: 1 })
    .toArray();
  const seen = new Set();
  const removed = [];
  let normalized = 0;

  for (const user of users) {
    const raw = user.phone;
    const clean = typeof raw === "string" ? normalizePhone(raw) : null;
    const who = user.email || String(user._id);

    if (!clean) {
      await User.collection.updateOne(
        { _id: user._id },
        { $unset: { phone: "" } },
      );
      removed.push(`${who}: "${raw}" is not a valid Ethiopian mobile number`);
      continue;
    }

    if (seen.has(clean)) {
      await User.collection.updateOne(
        { _id: user._id },
        { $unset: { phone: "" } },
      );
      removed.push(`${who}: ${clean} was already used by an older account`);
      continue;
    }

    seen.add(clean);
    if (clean !== raw) {
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { phone: clean } },
      );
      normalized += 1;
    }
  }

  console.log(`Phone numbers tidied: ${normalized}`);
  if (removed.length) {
    console.log(
      "Phone numbers removed (these accounts can still log in with their email):",
    );
    removed.forEach((line) => console.log(`  - ${line}`));
  }

  try {
    const dropped = await User.syncIndexes();
    console.log(
      `Indexes are up to date.${dropped.length ? ` Replaced: ${dropped.join(", ")}` : ""}`,
    );
  } catch (err) {
    console.error("Could not update the indexes:", err.message);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
