import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { getFinancialSummary } from "./businessDataService.js";

function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Creates fresh notifications for anything newly noteworthy, skipping anything
// already flagged recently so refreshing the page doesn't spam duplicates.
export async function generateNotifications(businessId) {
  const since = new Date();
  since.setHours(since.getHours() - 12); // don't re-notify the same thing within 12 hours

  // --- Low stock ---
  const lowStockProducts = await Product.find({
    business: businessId,
    isActive: true,
    $expr: { $lte: ["$currentStock", "$minStock"] },
  });

  for (const product of lowStockProducts) {
    const recent = await Notification.findOne({
      business: businessId,
      type: "low_stock",
      relatedId: product._id,
      createdAt: { $gte: since },
    });
    if (!recent) {
      await Notification.create({
        business: businessId,
        type: "low_stock",
        title: "Low Stock",
        message: `${product.name} has ${product.currentStock} units remaining`,
        relatedId: product._id,
      });
    }
  }

  // --- Overdue credit (any customer with an outstanding balance) ---
  const debtors = await Customer.find({
    business: businessId,
    outstandingBalance: { $gt: 0 },
  });

  for (const customer of debtors) {
    const recent = await Notification.findOne({
      business: businessId,
      type: "overdue_credit",
      relatedId: customer._id,
      createdAt: { $gte: since },
    });
    if (!recent) {
      await Notification.create({
        business: businessId,
        type: "overdue_credit",
        title: "Overdue Credit",
        message: `${customer.name} has ${customer.outstandingBalance.toLocaleString()} ETB overdue`,
        relatedId: customer._id,
      });
    }
  }

  // --- Sales milestone (today vs yesterday, matches the spec's "18% higher" example) ---
  const todaySummary = await getFinancialSummary(businessId, startOfDay(0));
  const yesterdaySummary = await getFinancialSummary(
    businessId,
    startOfDay(1),
    startOfDay(0),
  );

  if (yesterdaySummary.revenue > 0 && todaySummary.revenue > 0) {
    const percentChange = Math.round(
      ((todaySummary.revenue - yesterdaySummary.revenue) /
        yesterdaySummary.revenue) *
        100,
    );

    if (Math.abs(percentChange) >= 10) {
      const recent = await Notification.findOne({
        business: businessId,
        type: "sales_milestone",
        createdAt: { $gte: startOfDay(0) }, // once per day only
      });
      if (!recent) {
        const direction = percentChange > 0 ? "higher" : "lower";
        await Notification.create({
          business: businessId,
          type: "sales_milestone",
          title: "Sales Update",
          message: `Today is ${Math.abs(percentChange)}% ${direction} than yesterday`,
        });
      }
    }
  }
}
