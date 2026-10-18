import jsPDF from "jspdf";
import { receiptRows, statusText, noteText } from "../lib/receipt";

const FOREST = [10, 46, 36];
const GOLD = [245, 184, 61];
const MINT = [240, 246, 243];
const INK = [11, 26, 21];
const GREY = [110, 120, 115];
const GREEN = [4, 120, 87];

// The built-in PDF font only covers Latin text, so anything else becomes "?" instead of garbage
const safe = (value) =>
  String(value ?? "-")
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
    .replace(/[^\x20-\xFF]/g, "?");

export function downloadReceiptPdf({ invoice, businessName }) {
  const doc = new jsPDF({ unit: "pt", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 36;

  // Brand header
  doc.setFillColor(...FOREST);
  doc.rect(0, 0, W, 64, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 64, W, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("EthioFlow", margin, 40);
  const brandWidth = doc.getTextWidth("EthioFlow");
  doc.setTextColor(...GOLD);
  doc.text(" AI", margin + brandWidth, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 208);
  doc.text("Payment Receipt", W - margin, 38, { align: "right" });

  // Title and status
  let y = 108;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("Receipt", margin, y);
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(safe(statusText(invoice)).toUpperCase(), W - margin, y, {
    align: "right",
  });

  // Details
  y += 26;
  receiptRows(invoice, businessName).forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(label, margin, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(safe(value), W - margin, y, {
      align: "right",
      maxWidth: W - margin * 2 - 90,
    });

    y += 8;
    doc.setDrawColor(226, 237, 232);
    doc.line(margin, y, W - margin, y);
    y += 16;
  });

  // Total
  y += 6;
  doc.setFillColor(...MINT);
  doc.roundedRect(margin, y, W - margin * 2, 54, 8, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("TOTAL PAID", margin + 16, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...FOREST);
  doc.text(
    `${Number(invoice.amount).toLocaleString("en-US")} ETB`,
    margin + 16,
    y + 42,
  );
  y += 54 + 22;

  const note = noteText(invoice);
  if (note) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(safe(note), margin, y, { maxWidth: W - margin * 2 });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Thank you for choosing EthioFlow AI.", W / 2, H - 28, {
    align: "center",
  });

  doc.save(`EthioFlow-receipt-${invoice.reference}.pdf`);
}
