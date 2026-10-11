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
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700";

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-950">Products</h1>
          <p className="text-sm text-ink-900/60">Your product catalogue</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink-900/50">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-ink-900/50">
            No products yet. Add your first one.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
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
                <tr key={p._id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-medium text-forest-950">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-900/60">
                    {p.barcode || "—"}
                  </td>
                  <td className="px-5 py-3">{p.costPrice} ETB</td>
                  <td className="px-5 py-3">{p.sellingPrice} ETB</td>
                  <td className="px-5 py-3">
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLabelProduct(p)}
                        title="Barcode / QR label"
                        className="rounded-lg p-1.5 hover:bg-black/5"
                      >
                        <QrCode size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit"
                        className="rounded-lg p-1.5 hover:bg-black/5"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        title="Remove"
                        className="rounded-lg p-1.5 hover:bg-red-50"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
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
                  className="flex shrink-0 items-center justify-center rounded-lg border border-black/10 px-2.5 hover:bg-forest-50"
                >
                  <ScanLine size={16} />
                </button>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3 pb-2">
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
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
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
          <div className="print-area mx-auto flex w-56 flex-col items-center rounded-xl border border-dashed border-black/15 p-4 text-center">
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

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
            >
              <Printer size={15} /> Print label
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium hover:bg-black/5"
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
