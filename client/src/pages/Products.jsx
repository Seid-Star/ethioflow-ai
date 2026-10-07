import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../api/axios";
import Modal from "../components/ui/Modal";

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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
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
            <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest-50 text-left text-xs uppercase text-ink-900/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">SKU</th>
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
                  <td className="px-5 py-3 text-ink-900/60">{p.sku || "—"}</td>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg p-1.5 hover:bg-black/5"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
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
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-900/70">
              Product name
            </label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                SKU
              </label>
              <input
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Barcode
              </label>
              <input
                value={form.barcode}
                onChange={(e) => update("barcode", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Cost price (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Selling price (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                required
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Current stock
              </label>
              <input
                type="number"
                value={form.currentStock}
                onChange={(e) => update("currentStock", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-900/70">
                Min stock (alert)
              </label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => update("minStock", e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
          >
            {editingId ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
