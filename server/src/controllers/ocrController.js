import asyncHandler from "express-async-handler";
import { extractReceiptData } from "../services/ocrService.js";

// POST /api/ocr/scan-receipt — multipart upload, field name "receipt"
export const scanReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No receipt image was uploaded");
  }

  try {
    const extracted = await extractReceiptData(
      req.file.buffer,
      req.file.mimetype,
    );
    res.json(extracted);
  } catch (err) {
    res.status(422);
    throw new Error(err.message || "Failed to read the receipt");
  }
});
