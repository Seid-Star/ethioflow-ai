import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";

// POST /api/sales — the checkout action
export const createSale = asyncHandler(async (req, res) => {
  const { items, discount = 0, tax = 0, payments, customerId } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }
  if (!payments || payments.length === 0) {
    res.status(400);
    throw new Error("At least one payment line is required");
  }
  for (const p of payments) {
    if (!p.method || !p.amount || Number(p.amount) <= 0) {
      res.status(400);
      throw new Error("Each payment line needs a method and a positive amount");
    }
  }

  const hasCreditLine = payments.some((p) => p.method === "customer_credit");
  if (hasCreditLine && !customerId) {
    res.status(400);
    throw new Error("A customer must be selected to use Customer Credit");
  }

  const session = await mongoose.startSession();

  try {
    let subtotal = 0;
    const saleItems = [];

    await session.withTransaction(async () => {
      // Validate the customer up front, inside the transaction
      let customer = null;
      if (customerId) {
        customer = await Customer.findOne({
          _id: customerId,
          business: req.auth.business,
        }).session(session);
        if (!customer) throw new Error("Selected customer not found");
      }

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          business: req.auth.business,
        }).session(session);

        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.currentStock < item.quantity) {
          throw new Error(
            `Not enough stock for "${product.name}" (have ${product.currentStock}, need ${item.quantity})`,
          );
        }

        const previousStock = product.currentStock;
        product.currentStock -= item.quantity;
        await product.save({ session });

        await InventoryMovement.create(
          [
            {
              business: req.auth.business,
              product: product._id,
              type: "sale",
              previousStock,
              change: -item.quantity,
              newStock: product.currentStock,
              reason: "POS sale",
              performedBy: req.auth.id,
            },
          ],
          { session },
        );

        const lineTotal = product.sellingPrice * item.quantity;
        subtotal += lineTotal;

        saleItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          costPriceAtSale: product.costPrice,
          lineTotal,
        });
      }

      const total =
        Math.round((subtotal - Number(discount) + Number(tax)) * 100) / 100;
      const amountPaid =
        Math.round(
          payments.reduce((sum, p) => sum + Number(p.amount), 0) * 100,
        ) / 100;

      if (Math.abs(amountPaid - total) > 0.01) {
        throw new Error(
          `Payments (${amountPaid} ETB) must equal the total (${total} ETB)`,
        );
      }

      const paymentMethod = payments.length > 1 ? "split" : payments[0].method;

      const [sale] = await Sale.create(
        [
          {
            business: req.auth.business,
            cashier: req.auth.id,
            customer: customer?._id,
            items: saleItems,
            subtotal,
            discount: Number(discount),
            tax: Number(tax),
            total,
            payments: payments.map((p) => ({
              method: p.method,
              amount: Number(p.amount),
            })),
            paymentMethod,
            amountPaid,
          },
        ],
        { session },
      );

      // If a customer is attached, log the full purchase on their ledger, plus
      // whatever was actually paid right now (everything except the credit line).
      if (customer) {
        customer.recordEntry({
          type: "purchase",
          amount: total,
          note: "POS sale",
          relatedSale: sale._id,
        });

        const paidNow = payments
          .filter((p) => p.method !== "customer_credit")
          .reduce((sum, p) => sum + Number(p.amount), 0);

        if (paidNow > 0) {
          customer.recordEntry({
            type: "payment",
            amount: paidNow,
            note: "Paid at time of sale",
            relatedSale: sale._id,
          });
        }

        await customer.save({ session });
      }

      res.locals.sale = sale;
    });

    res.status(201).json(res.locals.sale);
  } finally {
    session.endSession();
  }
});

// GET /api/sales
export const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find({ business: req.auth.business })
    .populate("cashier", "name")
    .populate("customer", "name")
    .sort("-createdAt")
    .limit(100);

  res.json(sales);
});

// GET /api/sales/:id
export const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
    business: req.auth.business,
  })
    .populate("cashier", "name")
    .populate("customer", "name");
  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }
  res.json(sale);
});
