import { useEffect, useState } from "react";
import { PackagePlus, SlidersHorizontal } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

const typeStyles = {
  sale: "bg-red-50 text-red-700",
  stock_in: "bg-emerald-50 text-emerald-700",
  adjustment: "bg-amber-50 text-amber-700",
  transfer: "bg-sky-50 text-sky-700",
};

const typeLabels = {
  sale: "Sale",
  stock_in: "Stock In",
  adjustment: "Adjustment",
  transfer: "Transfer",
};

export default function Inventory() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'stock-in' | 'adjust' | null
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    change: "",
    reason: "",
  });
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    const [movementsRes, productsRes] = await Promise.all([
      api.get("/inventory/movements"),
      api.get("/products"),
    ]);
    setMovements(movementsRes.data);
    setProducts(productsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openModal(type) {
    setModalType(type);
    setForm({ productId: "", quantity: "", change: "", reason: "" });
    setError("");
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (modalType === "stock-in") {
        await api.post("/inventory/stock-in", {
          productId: form.productId,
          quantity: Number(form.quantity),
          reason: form.reason,
        });
      } else {
        await api.post("/inventory/adjust", {
          productId: form.productId,
          change: Number(form.change),
          reason: form.reason,
        });
      }
      setModalType(null);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Inventory</h1>
          <p className="text-sm text-ink-900/60">
            Full stock movement history — nothing is silently changed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("adjust")}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-forest-950 hover:bg-black/5"
          >
            <SlidersHorizontal size={15} /> Adjust Stock
          </button>
          <button
            onClick={() => openModal("stock-in")}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            <PackagePlus size={16} /> Stock In
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : movements.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">No stock movements yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Previous</th>
                <th className="px-5 py-3">Change</th>
                <th className="px-5 py-3">New Stock</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m._id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {m.product?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {m.previousStock}
                  </td>
                  <td
                    className={`px-5 py-3 font-semibold ${m.change < 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {m.change > 0 ? `+${m.change}` : m.change}
                  </td>
                  <td className="px-5 py-3 font-medium">{m.newStock}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[m.type]}`}
                    >
                      {typeLabels[m.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {m.performedBy?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-900/60">
                    {m.reason || "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-900/50">
                    {new Date(m.createdAt).toLocaleDateString()}{" "}
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === "stock-in" ? "Record Stock In" : "Adjust Stock"}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Product
            </label>
            <select
              value={form.productId}
              onChange={(e) => update("productId", e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (current: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          {modalType === "stock-in" ? (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Quantity received
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          ) : (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Change (use a minus sign to reduce, e.g. -3)
              </label>
              <input
                type="number"
                value={form.change}
                onChange={(e) => update("change", e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          )}

          <div className="mb-5">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Reason
            </label>
            <input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder={
                modalType === "stock-in"
                  ? "e.g. Supplier delivery"
                  : "e.g. Damaged in storage"
              }
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
