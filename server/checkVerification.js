import mongoose from "mongoose";
import crypto from "crypto";
import User from "./src/models/User.js";

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

const email = "gred5998@gmail.com";

const user = await User.findOne({ email })
  .select("+emailVerifyTokenHash +emailVerifyExpires +emailVerifySentAt")
  .lean();

if (!user) {
  console.log("User not found.");
} else {
  console.log({
    userFound: true,
    hashExists: Boolean(user.emailVerifyTokenHash),
    hashLength: user.emailVerifyTokenHash?.length ?? 0,
    expiresAt: user.emailVerifyExpires,
    lastSentAt: user.emailVerifySentAt,
  });
}

await mongoose.disconnect();
