import Business from "../models/Business.js";
import SubscriptionInvoice from "../models/SubscriptionInvoice.js";
import AuditLog from "../models/AuditLog.js";
import { DAY } from "./subscriptionService.js";
import { verifyTransaction } from "./chapaService.js";

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const periodDays = (cycle) => (cycle === "yearly" ? 365 : 30);

export async function activatePlan(
  businessId,
  { plan, billingCycle, periodEnd },
) {
  await Business.findByIdAndUpdate(businessId, {
    $set: {
      subscriptionPlan: plan,
      subscriptionStatus: "active",
      billingCycle,
      currentPeriodEnd: periodEnd,
    },
  });
}
export async function settleInvoice(invoice) {
  if (invoice.status === "paid") return invoice;

  const result = await verifyTransaction(invoice.txRef);

  if (result.status === "success") {
    const amountOk =
      Number.isFinite(result.amount) && result.amount + 0.01 >= invoice.amount;
    const currencyOk = !result.currency || result.currency === "ETB";
    const refOk = !result.txRef || result.txRef === invoice.txRef;

    if (!amountOk || !currencyOk || !refOk) {
      console.warn(
        `⚠ Payment ${invoice.txRef} did not match its invoice (amount ${result.amount} ${result.currency})`,
      );
      return SubscriptionInvoice.findByIdAndUpdate(
        invoice._id,
        {
          $set: {
            status: "failed",
            failureReason: "The confirmed payment did not match this invoice",
          },
        },
        { new: true },
      );
    }

    const periodStart = new Date();
    const periodEnd = new Date(
      periodStart.getTime() + periodDays(invoice.billingCycle) * DAY,
    );
    const paid = await SubscriptionInvoice.findOneAndUpdate(
      { _id: invoice._id, status: { $in: ["pending", "expired", "failed"] } },
      {
        $set: {
          status: "paid",
          failureReason: undefined,
          paidAt: periodStart,
          periodStart,
          periodEnd,
          providerMode: result.mode,
          paymentMethod: result.method || invoice.paymentMethod,
          providerReference: result.reference,
        },
      },
      { new: true },
    );
    if (!paid) return SubscriptionInvoice.findById(invoice._id);

    await activatePlan(invoice.business, {
      plan: invoice.plan,
      billingCycle: invoice.billingCycle,
      periodEnd,
    });

    try {
      await AuditLog.create({
        business: invoice.business,
        user: invoice.createdBy,
        role: "owner",
        action: "subscription.payment",
        entityType: "subscription",
        summary: `Payment confirmed: ${cap(invoice.plan)} plan (${invoice.billingCycle}) - ${invoice.amount.toLocaleString()} ETB`,
      });
    } catch (err) {
      console.error("Audit log write failed:", err.message);
    }

    return paid;
  }

  if (result.status === "failed") {
    return SubscriptionInvoice.findByIdAndUpdate(
      invoice._id,
      {
        $set: {
          status: "failed",
          failureReason: "The payment was not completed",
        },
      },
      { new: true },
    );
  }

  return invoice;
}
