import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Refund from "../models/Refund.js";
import { pointsEarnedFor } from "../config/loyalty.js";

const round2 = (n) => Math.round(n * 100) / 100;
const METHODS = [
  "cash",
  "mobile_money",
  "bank_transfer",
  "card",
  "customer_credit",
];

// POST /api/sales/:id/refund
export const refundSale = asyncHandler(async (req, res) => {
  const { items, reason, refundMethod = "cash" } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Select at least one item to refund");
  }
  if (!METHODS.includes(refundMethod)) {
    res.status(400);
    throw new Error("Invalid refund method");
  }

  const session = await mongoose.startSession();
  let createdRefund;

  try {
    await session.withTransaction(async () => {
      const sale = await Sale.findOne({
        _id: req.params.id,
        business: req.auth.business,
      }).session(session);
      if (!sale) throw new Error("Sale not found");

      if (refundMethod === "customer_credit" && !sale.customer) {
        throw new Error(
          "This sale has no customer, so it cannot be refunded as account credit",
        );
      }

      // Refund what the customer actually paid per item: discounts, points and tax are shared proportionally.
      const ratio = sale.subtotal > 0 ? sale.total / sale.subtotal : 1;

      let amount = 0;
      let costReversed = 0;
      const refundItems = [];

      for (const reqItem of items) {
        const qty = Number(reqItem.quantity);
        if (!qty || qty <= 0) continue;

        const line = sale.items.find(
          (l) => l.product.toString() === String(reqItem.productId),
        );
        if (!line) throw new Error("An item you selected is not on this sale");

        const remaining = line.quantity - (line.refundedQuantity || 0);
        if (qty > remaining)
          throw new Error(
            `Only ${remaining} of "${line.name}" can still be refunded`,
          );

        const refundValue = round2(line.unitPrice * qty * ratio);
        amount += refundValue;
        costReversed += line.costPriceAtSale * qty;
        line.refundedQuantity = (line.refundedQuantity || 0) + qty;

        const product = await Product.findOne({
          _id: line.product,
          business: req.auth.business,
        }).session(session);
        if (product) {
          const previousStock = product.currentStock;
          product.currentStock += qty;
          await product.save({ session });

          await InventoryMovement.create(
            [
              {
                business: req.auth.business,
                product: product._id,
                type: "refund",
                previousStock,
                change: qty,
                newStock: product.currentStock,
                reason: `Refund: ${reason || "Customer return"}`,
                performedBy: req.auth.id,
              },
            ],
            { session },
          );
        }

        refundItems.push({
          product: line.product,
          name: line.name,
          quantity: qty,
          unitPrice: line.unitPrice,
          costPriceAtSale: line.costPriceAtSale,
          refundValue,
        });
      }

      if (refundItems.length === 0)
        throw new Error("Select at least one item to refund");

      amount = round2(amount);
      const remainingValue = round2(sale.total - (sale.refundedTotal || 0));
      if (amount > remainingValue) amount = remainingValue; // guards tiny rounding overshoot

      sale.refundedTotal = round2((sale.refundedTotal || 0) + amount);
      await sale.save({ session });

      if (sale.customer) {
        const customer = await Customer.findOne({
          _id: sale.customer,
          business: req.auth.business,
        }).session(session);
        if (customer) {
          if (refundMethod === "customer_credit") {
            if (amount > customer.outstandingBalance) {
              throw new Error(
                `Account credit refund (${amount} ETB) is more than the customer owes (${customer.outstandingBalance} ETB). Choose a cash refund instead.`,
              );
            }
            customer.recordEntry({
              type: "payment",
              amount,
              note: "Refund applied to balance",
              relatedSale: sale._id,
            });
          }
          // Take back the points that were earned on the refunded amount
          customer.loyaltyPoints = Math.max(
            0,
            customer.loyaltyPoints - pointsEarnedFor(amount),
          );
          await customer.save({ session });
        }
      }

      const [refund] = await Refund.create(
        [
          {
            business: req.auth.business,
            sale: sale._id,
            items: refundItems,
            amount,
            costReversed: round2(costReversed),
            reason,
            refundMethod,
            refundedBy: req.auth.id,
          },
        ],
        { session },
      );
      createdRefund = refund;
    });

    res.status(201).json(createdRefund);
  } catch (err) {
    res.status(400);
    throw err;
  } finally {
    session.endSession();
  }
});
