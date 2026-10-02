import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Purchase from "../models/Purchase.js";
import Supplier from "../models/Supplier.js";

// POST /api/purchases — "Order → Receive Stock → Balance → Payment", all at once for the MVP
export const createPurchase = asyncHandler(async (req, res) => {
  const { supplierId, items, amountPaid = 0, notes } = req.body;

  if (!supplierId) {
    res.status(400);
    throw new Error("A supplier is required");
  }
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("At least one item is required");
  }

  const session = await mongoose.startSession();

  try {
    let totalAmount = 0;
    const purchaseItems = [];

    await session.withTransaction(async () => {
      const supplier = await Supplier.findOne({
        _id: supplierId,
        business: req.auth.business,
      }).session(session);
      if (!supplier) throw new Error("Supplier not found");

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          business: req.auth.business,
        }).session(session);
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        const costPrice = Number(item.costPrice) || product.costPrice;
        const quantity = Number(item.quantity);
        if (quantity <= 0)
          throw new Error(`Quantity must be positive for "${product.name}"`);

        const previousStock = product.currentStock;
        product.currentStock += quantity;
        product.costPrice = costPrice; // keep the catalogue price current with the latest delivery cost
        await product.save({ session });

        await InventoryMovement.create(
          [
            {
              business: req.auth.business,
              product: product._id,
              type: "stock_in",
              previousStock,
              change: quantity,
              newStock: product.currentStock,
              reason: `Purchase from ${supplier.name}`,
              performedBy: req.auth.id,
            },
          ],
          { session },
        );

        const lineTotal = costPrice * quantity;
        totalAmount += lineTotal;

        purchaseItems.push({
          product: product._id,
          name: product.name,
          quantity,
          costPrice,
          lineTotal,
        });
      }

      const paidNow = Math.min(Number(amountPaid) || 0, totalAmount);

      const [purchase] = await Purchase.create(
        [
          {
            business: req.auth.business,
            supplier: supplier._id,
            items: purchaseItems,
            totalAmount,
            amountPaid: paidNow,
            recordedBy: req.auth.id,
            notes,
          },
        ],
        { session },
      );

      supplier.recordEntry({
        type: "purchase",
        amount: totalAmount,
        note: "Stock delivery",
        relatedPurchase: purchase._id,
      });
      if (paidNow > 0) {
        supplier.recordEntry({
          type: "payment",
          amount: paidNow,
          note: "Paid at delivery",
          relatedPurchase: purchase._id,
        });
      }
      await supplier.save({ session });

      res.locals.purchase = purchase;
    });

    res.status(201).json(res.locals.purchase);
  } finally {
    session.endSession();
  }
});

// GET /api/purchases
export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ business: req.auth.business })
    .populate("supplier", "name")
    .sort("-createdAt")
    .limit(100);
  res.json(purchases);
});
