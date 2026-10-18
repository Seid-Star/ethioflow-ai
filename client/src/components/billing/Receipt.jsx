import { useState } from "react";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { receiptRows, statusText, noteText } from "../../lib/receipt";

export default function Receipt({ invoice, businessName }) {
  const [busy, setBusy] = useState(false);
  const note = noteText(invoice);

  async function downloadPdf() {
    setBusy(true);
    try {
      // Loaded only when needed, so the PDF library doesn't slow down the rest of the app
      const { downloadReceiptPdf } = await import("../../utils/receiptPdf");
      downloadReceiptPdf({ invoice, businessName });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="print-area rounded-2xl border border-black/10 bg-white p-6 text-left">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-forest-950">
              EthioFlow <span className="text-gold-500">AI</span>
            </p>
            <p className="text-xs text-ink-900/50">Payment Receipt</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={12} /> {statusText(invoice)}
          </span>
        </div>

        <div className="divide-y divide-black/5">
          {receiptRows(invoice, businessName).map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 py-2.5 text-sm"
            >
              <span className="text-ink-900/55">{label}</span>
              <span className="text-right font-medium text-forest-950 [overflow-wrap:anywhere]">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-forest-50 px-4 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-900/55">
            Total paid
          </span>
          <span className="text-xl font-bold text-forest-950">
            {invoice.amount.toLocaleString()} ETB
          </span>
        </div>

        {note && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {note}
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={downloadPdf}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-60"
        >
          <Download size={15} /> {busy ? "Preparing..." : "Download PDF"}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium hover:bg-black/5"
        >
          <Printer size={15} /> Print
        </button>
      </div>
    </div>
  );
}
