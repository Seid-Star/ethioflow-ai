import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";
import { Camera, Sparkles } from "lucide-react";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lines, setLines] = useState([
    { productId: "", quantity: "", costPrice: "" },
  ]);
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [p, pr, su] = await Promise.all([
      api.get("/purchases"),
      api.get("/products"),
      api.get("/suppliers"),
    ]);
    setPurchases(p.data);
    setProducts(pr.data);
    setSuppliers(su.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLine(i, key, value) {
    setLines((ls) =>
      ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)),
    );
  }

  function addLine() {
    setLines((ls) => [...ls, { productId: "", quantity: "", costPrice: "" }]);
  }

  function removeLine(i) {
    setLines((ls) => ls.filter((_, idx) => idx !== i));
  }

  const total = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.costPrice) || 0),
    0,
  );
  async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setScanError("");

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const { data } = await api.post("/ocr/scan-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Try to match the extracted supplier name to an existing one; otherwise leave blank for the owner to pick
      const matchedSupplier = suppliers.find(
        (s) =>
          data.supplierName &&
          s.name.toLowerCase() === data.supplierName.toLowerCase(),
      );
      if (matchedSupplier) setSupplierId(matchedSupplier._id);

      // Try to match each extracted item name to an existing product
      const matchedLines = data.items.map((item) => {
        const matchedProduct = products.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase(),
        );
        return {
          productId: matchedProduct?._id || "",
          quantity: item.quantity || "",
          costPrice: item.unitPrice || "",
          extractedName: item.name, // shown if no product matched, so the owner isn't left guessing
        };
      });
      setLines(
        matchedLines.length > 0
          ? matchedLines
          : [{ productId: "", quantity: "", costPrice: "" }],
      );

      setModalOpen(true); // open the normal Record Purchase modal, now pre-filled for review
    } catch (err) {
      setScanError(
        err?.response?.data?.message ||
          "Could not read the receipt. Try again with a clearer photo.",
      );
    } finally {
      setScanning(false);
      e.target.value = ""; // allow re-selecting the same file if retrying
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/purchases", {
        supplierId,
        items: lines
          .filter((l) => l.productId && l.quantity)
          .map((l) => ({
            productId: l.productId,
            quantity: Number(l.quantity),
            costPrice: Number(l.costPrice),
          })),
        amountPaid: Number(amountPaid) || 0,
      });
      setModalOpen(false);
      setSupplierId("");
      setLines([{ productId: "", quantity: "", costPrice: "" }]);
      setAmountPaid("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      {scanning && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-800">
          <Sparkles size={16} className="animate-pulse" /> Reading your
          receipt...
        </div>
      )}
      {scanError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {scanError}
        </p>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Purchases</h1>
          <p className="text-sm text-ink-900/60">
            Order → Receive Stock → Balance → Payment
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-forest-950 hover:bg-black/5">
            <Camera size={16} /> Scan Receipt
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleReceiptUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            <Plus size={16} /> Record Purchase
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : purchases.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No purchases recorded yet.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {p.supplier?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {p.items.length} item(s)
                  </td>
                  <td className="px-5 py-3">
                    {p.totalAmount.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    {p.amountPaid.toLocaleString()} ETB
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        p.totalAmount - p.amountPaid > 0
                          ? "font-semibold text-amber-600"
                          : "text-emerald-600"
                      }
                    >
                      {(p.totalAmount - p.amountPaid).toLocaleString()} ETB
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-900/50">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Purchase"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            >
              <option value="">Select a supplier...</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <p className="mb-1 text-xs font-medium text-ink-900/70">
            Items received
          </p>
          <div className="mb-3 space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(i, "productId", e.target.value)}
                  required
                  className="flex-1 rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none"
                >
                  <option value="">Product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!line.productId && line.extractedName && (
                  <span
                    className="text-[10px] text-amber-600"
                    title={`OCR read: "${line.extractedName}" — no matching product found`}
                  >
                    ⚠ "{line.extractedName}"
                  </span>
                )}
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  required
                  className="w-16 rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Cost/unit"
                  value={line.costPrice}
                  onChange={(e) => updateLine(i, "costPrice", e.target.value)}
                  required
                  className="w-20 rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="rounded-md p-1 hover:bg-red-50"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLine}
              className="text-xs font-medium text-forest-700 hover:underline"
            >
              + Add another item
            </button>
          </div>

          <div className="mb-3 flex justify-between rounded-lg bg-forest-50 px-3 py-2 text-sm font-semibold text-forest-900">
            <span>Total</span>
            <span>{total.toFixed(2)} ETB</span>
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Amount paid now (leave 0 if fully on credit)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Record Purchase
          </button>
        </form>
      </Modal>
    </div>
  );
}
