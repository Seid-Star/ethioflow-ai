import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Sale from "../models/Sale.js";

// POST /api/sync/sales — accepts a batch of offline sales and commits each one safely
export const syncSales = asyncHandler(async (req, res) => {
  const { sales } = req.body;

  if (!sales || sales.length === 0) {
    res.status(400);
    throw new Error("No sales provided to sync");
  }

  const results = [];

  for (const offlineSale of sales) {
    const {
      offlineTransactionId,
      items,
      discount = 0,
      tax = 0,
      payments,
      createdAtLocal,
    } = offlineSale;

    if (!offlineTransactionId) {
      results.push({
        offlineTransactionId: null,
        status: "error",
        message: "Missing offline transaction id",
      });
      continue;
    }

    // Idempotency check: if this exact offline sale already made it to the server
    // (e.g. a previous sync partially succeeded), don't process it again.
    const existing = await Sale.findOne({
      business: req.auth.business,
      offlineTransactionId,
    });
    if (existing) {
      results.push({
        offlineTransactionId,
        status: "already_synced",
        saleId: existing._id,
      });
      continue;
    }

    const session = await mongoose.startSession();
    try {
      let createdSaleId;
      let hadConflict = false;

      await session.withTransaction(async () => {
        let subtotal = 0;
        const saleItems = [];

        for (const item of items) {
          const product = await Product.findOne({
            _id: item.productId,
            business: req.auth.business,
          }).session(session);

          if (!product) throw new Error(`Product not found: ${item.productId}`);

          const previousStock = product.currentStock;
          const qty = item.quantity;

          // If stock can't cover this (e.g. another device also sold it while both
          // were offline), we do NOT discard the sale — the money already changed
          // hands in the real world. We let stock go negative and flag it, so the
          // owner sees a clear conflict to review rather than a silently lost sale.
          if (product.currentStock < qty) hadConflict = true;

          product.currentStock -= qty;
          await product.save({ session });

          await InventoryMovement.create(
            [
              {
                business: req.auth.business,
                product: product._id,
                type: "sale",
                previousStock,
                change: -qty,
                newStock: product.currentStock,
                reason: hadConflict
                  ? "Synced offline sale (stock conflict)"
                  : "Synced offline sale",
                performedBy: req.auth.id,
              },
            ],
            { session },
          );

          const lineTotal = product.sellingPrice * qty;
          subtotal += lineTotal;
          saleItems.push({
            product: product._id,
            name: product.name,
            quantity: qty,
            unitPrice: product.sellingPrice,
            costPriceAtSale: product.costPrice,
            lineTotal,
          });
        }

        const total =
          Math.round((subtotal - Number(discount) + Number(tax)) * 100) / 100;
        const amountPaid = payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );

        const [sale] = await Sale.create(
          [
            {
              business: req.auth.business,
              cashier: req.auth.id,
              items: saleItems,
              subtotal,
              discount: Number(discount),
              tax: Number(tax),
              total,
              payments,
              paymentMethod: payments.length > 1 ? "split" : payments[0].method,
              amountPaid,
              isOfflineSale: true,
              offlineTransactionId,
              syncedAt: new Date(),
              hasStockConflict: hadConflict,
            },
          ],
          { session },
        );

        // Backdate to when the sale actually happened on the device, not when it synced
        if (createdAtLocal) {
          await Sale.updateOne(
            { _id: sale._id },
            { createdAt: new Date(createdAtLocal) },
          ).session(session);
        }

        createdSaleId = sale._id;
      });

      results.push({
        offlineTransactionId,
        status: hadConflict ? "synced_with_conflict" : "synced",
        saleId: createdSaleId,
      });
    } catch (err) {
      results.push({
        offlineTransactionId,
        status: "error",
        message: err.message,
      });
    } finally {
      session.endSession();
    }
  }

  res.json({ results });
});
