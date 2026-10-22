import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, QrCode, ScanLine, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";
import BarcodeScannerModal from "../components/ui/BarcodeScannerModal";

const emptyForm = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  brand: "",
  costPrice: "",
  sellingPrice: "",
  currentStock: "",
  minStock: "",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-forest-950 outline-none transition placeholder:text-ink-900/35 focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-900/70">
        {label}
      </label>
      {children}
    </div>
  );
}

function generateBarcode() {
  return "6" + String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [labelProduct, setLabelProduct] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    const { data } = await api.get("/products");
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      sku: product.sku || "",
      barcode: product.barcode || "",
      category: product.category || "",
      brand: product.brand || "",
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        currentStock: Number(form.currentStock) || 0,
        minStock: Number(form.minStock) || 0,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this product?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-950 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-900/60">Your product catalogue</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-forest-950 shadow-sm transition hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40 sm:w-auto sm:py-2.5"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-ink-900/50">
            <p className="font-medium text-forest-950">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
              <Plus size={22} />
            </div>
            <p className="text-sm font-semibold text-forest-950">
              No products yet
            </p>
            <p className="mt-1 text-sm text-ink-900/55">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-forest-50 text-left text-[11px] font-semibold uppercase tracking-wider text-forest-950/60">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Barcode</th>
                  <th className="px-5 py-3">Cost</th>
                  <th className="px-5 py-3">Selling Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-black/5 transition-colors hover:bg-forest-50/50"
                  >
                    <td className="px-5 py-4 font-semibold text-forest-950">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ink-900/60">
                      {p.barcode || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink-900/70">
                      {p.costPrice} ETB
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-forest-950">
                      {p.sellingPrice} ETB
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          p.currentStock <= p.minStock
                            ? "font-semibold text-red-600"
                            : ""
                        }
                      >
                        {p.currentStock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setLabelProduct(p)}
                          title="Barcode / QR label"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-forest-800 transition hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                        >
                          <QrCode size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-forest-800 transition hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          title="Remove"
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Field label="Product name">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="SKU">
              <input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Barcode">
              <div className="flex gap-1.5">
                <input
                  value={form.barcode}
                  onChange={(e) => update("barcode", e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  title="Scan with camera"
                  className="flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-black/10 px-3 text-forest-800 transition hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-forest-700/20"
                >
                  <ScanLine size={16} />
                </button>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Brand">
              <input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Cost price (ETB)">
              <input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Selling price (ETB)">
              <input
                type="number"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
            <Field label="Current stock">
              <input
                type="number"
                value={form.currentStock}
                onChange={(e) => update("currentStock", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Min stock (alert)">
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => update("minStock", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 shadow-sm transition hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          >
            {editingId ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </Modal>

      {/* Rendered after the form modal so it stacks on top of it */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Scan Product Barcode"
        onScan={(code) => {
          update("barcode", code);
          return {
            ok: true,
            message: `Barcode captured: ${code}`,
            close: true,
          };
        }}
      />

      {labelProduct && (
        <LabelModal
          product={labelProduct}
          onClose={() => setLabelProduct(null)}
          onSaved={(updated) => {
            setLabelProduct(updated);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

function LabelModal({ product, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put(`/products/${product._id}`, {
        name: product.name,
        sku: product.sku || "",
        barcode: generateBarcode(),
        category: product.category || "",
        brand: product.brand || "",
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        currentStock: product.currentStock,
        minStock: product.minStock,
      });
      onSaved(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not generate a barcode");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Product Label">
      {product.barcode ? (
        <>
          <div className="print-area mx-auto flex w-full max-w-56 flex-col items-center rounded-2xl border border-dashed border-black/15 bg-white p-5 text-center">
            <p className="text-sm font-bold text-forest-950">{product.name}</p>
            <div className="my-3">
              <QRCodeSVG value={product.barcode} size={150} level="M" />
            </div>
            <p className="font-mono text-xs tracking-wider text-ink-900/70">
              {product.barcode}
            </p>
            <p className="mt-1 text-sm font-semibold text-forest-950">
              {product.sellingPrice} ETB
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => window.print()}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-600"
            >
              <Printer size={15} /> Print label
            </button>
            <button
              onClick={onClose}
              className="min-h-11 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-forest-950 transition hover:bg-black/5"
            >
              Close
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-ink-900/45">
            Scan this code in POS to add the product to the cart.
          </p>
        </>
      ) : (
        <div className="text-center">
          <QrCode size={36} className="mx-auto mb-3 text-ink-900/25" />
          <p className="mb-1 text-sm font-medium text-forest-950">
            {product.name} has no barcode yet
          </p>
          <p className="mb-5 text-xs text-ink-900/55">
            Generate one now, or edit the product and scan the barcode printed
            on the packaging.
          </p>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleGenerate}
            disabled={saving}
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:opacity-50"
          >
            {saving ? "Generating..." : "Generate barcode"}
          </button>
        </div>
      )}
    </Modal>
  );
}
