import { planName } from "./plans";

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "-");

export function statusText(invoice) {
  if (invoice.providerMode === "test") return "Paid (test payment)";
  if (invoice.mode === "demo") return "Paid (demo)";
  return "Paid";
}

export function noteText(invoice) {
  if (invoice.providerMode === "test")
    return "This was a test payment. No real money was taken.";
  if (invoice.mode === "demo")
    return "Demo billing. No real payment was taken.";
  return "";
}

// One list of rows, shared by the on-screen receipt and the PDF so they can never disagree
export function receiptRows(invoice, businessName) {
  const method = invoice.paymentMethod
    ? invoice.paymentMethod.replace(/_/g, " ")
    : "chapa";

  return [
    ["Receipt no.", invoice.reference],
    ["Date", fmtDateTime(invoice.paidAt || invoice.createdAt)],
    ["Billed to", businessName || "-"],
    ["Plan", `${planName(invoice.plan)} (${invoice.billingCycle})`],
    ["Payment method", method.charAt(0).toUpperCase() + method.slice(1)],
    ...(invoice.providerReference
      ? [["Provider reference", invoice.providerReference]]
      : []),
    [
      "Coverage period",
      `${fmtDate(invoice.periodStart)} to ${fmtDate(invoice.periodEnd)}`,
    ],
  ];
}
