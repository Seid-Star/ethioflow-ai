import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { normalizePhone } from "./phone.js";

const identifier = (process.argv[2] || "").trim();
const revoke = process.argv.includes("--remove");

if (!identifier) {
  console.log("Usage:");
  console.log("  node src/utils/makeAdmin.js you@example.com");
  console.log("  node src/utils/makeAdmin.js 0911234567");
  console.log("  node src/utils/makeAdmin.js you@example.com --remove");
  process.exit(0);
}

await connectDB();

let query;
if (identifier.includes("@")) {
  query = { email: identifier.toLowerCase() };
} else {
  const phone = normalizePhone(identifier);
  query = phone ? { phone } : null;
}

const user = query
  ? await User.findOne(query).select("name email phone isPlatformAdmin")
  : null;

if (!user) {
  console.log(`No account found for "${identifier}".`);
} else {
  await User.updateOne(
    { _id: user._id },
    { $set: { isPlatformAdmin: !revoke } },
  );
  console.log(
    revoke
      ? `Platform admin access removed from ${user.name} (${user.email || user.phone}).`
      : `${user.name} (${user.email || user.phone}) is now a platform admin. Log out and log back in to see the Platform Admin page.`,
  );
}

await mongoose.disconnect();
