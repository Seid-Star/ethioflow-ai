import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Split,
  X,
  UserCircle2,
  CloudOff,
  Star,
} from "lucide-react";
import { api } from "../api/axios";
import { useCartStore } from "../store/cartStore";
import { useOnlineStatus } from "../offline/useOnlineStatus";
import {
  cacheProducts,
  getCachedProducts,
  savePendingSale,
} from "../offline/db";
import { ETB_PER_POINT, pointsEarnedFor } from "../lib/loyalty";

const baseMethods = [
  { value: "cash", label: "Cash" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
];

export default function POS() {
  const isOnline = useOnlineStatus();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isSplit, setIsSplit] = useState(false);
  const [singleMethod, setSingleMethod] = useState("cash");
  const [splitLines, setSplitLines] = useState([
    { method: "cash", amount: "" },
  ]);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    items,
    addItem,
    incrementQty,
    decrementQty,
    removeItem,
    clear,
    subtotal,
  } = useCartStore();

  useEffect(() => {
    async function loadProducts() {
      if (isOnline) {
        try {
          const { data } = await api.get("/products");
          setProducts(data);
          cacheProducts(data);
        } catch {
          const cached = await getCachedProducts();
          setProducts(cached);
        }
      } else {
        const cached = await getCachedProducts();
        setProducts(cached);
      }
    }
    loadProducts();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      api.get("/customers").then(({ data }) => setCustomers(data));
    } else {
      setCustomers([]);
      setCustomerId("");
      setRedeemPoints(0);
    }
  }, [isOnline]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase() === search.toLowerCase(),
  );

  const sub = subtotal();
  const selectedCustomer = customers.find((c) => c._id === customerId);
  const availablePoints = selectedCustomer?.loyaltyPoints || 0;
  const payableBeforePoints = Math.max(0, sub - Number(discount));
  const maxRedeemable = Math.min(
    availablePoints,
    Math.floor(payableBeforePoints / ETB_PER_POINT),
  );
  const pointsToUse = Math.min(
    Math.max(0, Math.floor(Number(redeemPoints) || 0)),
    maxRedeemable,
  );
  const pointsDiscount = pointsToUse * ETB_PER_POINT;

  const total = Math.max(
    0,
    sub - Number(discount) - pointsDiscount + Number(tax),
  );
  const pointsToEarn =
    selectedCustomer && isOnline ? pointsEarnedFor(total) : 0;

  const methods =
    customerId && isOnline
      ? [...baseMethods, { value: "customer_credit", label: "Customer Credit" }]
      : baseMethods;

  const splitSum = splitLines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const splitRemaining = Math.round((total - splitSum) * 100) / 100;

  function updateSplitLine(index, key, value) {
    setSplitLines((lines) =>
      lines.map((l, i) => (i === index ? { ...l, [key]: value } : l)),
    );
  }
  function addSplitLine() {
    setSplitLines((lines) => [...lines, { method: "cash", amount: "" }]);
  }
  function removeSplitLine(index) {
    setSplitLines((lines) => lines.filter((_, i) => i !== index));
  }

  function resetSale() {
    clear();
    setDiscount(0);
    setTax(0);
    setRedeemPoints(0);
    setIsSplit(false);
    setSplitLines([{ method: "cash", amount: "" }]);
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setError("");

    const payments = isSplit
      ? splitLines
          .filter((l) => Number(l.amount) > 0)
          .map((l) => ({ method: l.method, amount: Number(l.amount) }))
      : [{ method: singleMethod, amount: total }];

    setSubmitting(true);

    if (!isOnline) {
      const offlineSale = {
        offlineTransactionId: crypto.randomUUID(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.qty,
          unitPrice: i.price,
        })),
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        subtotal: sub,
        total,
        payments,
        createdAtLocal: new Date().toISOString(),
      };
      await savePendingSale(offlineSale);

      setReceipt({ ...offlineSale, isOffline: true });
      resetSale();
      setSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post("/sales", {
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        payments,
        customerId: customerId || undefined,
        redeemPoints: pointsToUse,
      });
      setReceipt(data);
      resetSale();
      setCustomerId("");
      const [{ data: freshProducts }, { data: freshCustomers }] =
        await Promise.all([api.get("/products"), api.get("/customers")]);
      setProducts(freshProducts);
      cacheProducts(freshProducts);
      setCustomers(freshCustomers);
    } catch (err) {
      setError(err?.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canCharge =
    items.length > 0 &&
    !submitting &&
    (!isSplit || Math.abs(splitRemaining) < 0.01);

  if (receipt) {
    return <Receipt sale={receipt} onNewSale={() => setReceipt(null)} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {!isOnline && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <CloudOff size={16} />
            You're offline. Sales will be saved on this device and synced
            automatically once you're back online.
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5">
          <Search size={18} className="text-ink-900/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or scan barcode..."
            autoFocus
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p._id}
              onClick={() => p.currentStock > 0 && addItem(p)}
              disabled={p.currentStock === 0}
              className="rounded-xl border border-black/5 bg-white p-4 text-left transition hover:border-forest-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <p className="mb-1 text-sm font-semibold text-forest-950">
                {p.name}
              </p>
              <p className="text-xs text-ink-900/50">{p.sellingPrice} ETB</p>
              <p
                className={`mt-1 text-xs ${p.currentStock <= p.minStock ? "text-red-500" : "text-ink-900/40"}`}
              >
                Stock: {p.currentStock}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-ink-900/40">
              No products match.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-forest-950">
          Current Sale
        </h2>

        <div className="mb-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-900/70">
            <UserCircle2 size={14} /> Customer (optional)
          </label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setRedeemPoints(0);
            }}
            disabled={!isOnline}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-forest-700 disabled:bg-black/5 disabled:text-ink-900/40"
          >
            <option value="">Walk-in customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
                {c.loyaltyPoints ? ` · ⭐ ${c.loyaltyPoints}` : ""}
              </option>
            ))}
          </select>
          {!isOnline && (
            <p className="mt-1 text-[11px] text-ink-900/40">
              Customer Credit and loyalty need a connection — cash/mobile money
              only while offline
            </p>
          )}

          {selectedCustomer && (
            <div className="mt-3 rounded-xl bg-gradient-to-br from-forest-900 to-forest-700 p-3.5 text-white">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-medium text-gold-500">
                  <Star size={13} className="fill-gold-500" /> Loyalty Points
                </p>
                <p className="text-lg font-bold">{availablePoints}</p>
              </div>

              {availablePoints > 0 && items.length > 0 ? (
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={maxRedeemable}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    className="w-20 rounded-md bg-white/10 px-2 py-1 text-sm text-white outline-none placeholder:text-white/40"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setRedeemPoints(maxRedeemable)}
                    className="rounded-md bg-gold-500 px-2.5 py-1 text-xs font-semibold text-forest-950"
                  >
                    Use max
                  </button>
                  <p className="text-[11px] text-white/60">
                    {pointsToUse > 0
                      ? `= ${pointsDiscount.toFixed(2)} ETB off`
                      : `up to ${maxRedeemable} usable`}
                  </p>
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] text-white/55">
                  {availablePoints > 0
                    ? "Add items to redeem points"
                    : "Earns 1 point for every 10 ETB spent"}
                </p>
              )}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-900/40">
            Cart is empty
          </p>
        ) : (
          <div className="mb-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-forest-950">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-900/50">
                    {item.price} ETB each
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => decrementQty(item.productId)}
                    className="rounded-md border border-black/10 p-1 hover:bg-black/5"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm">{item.qty}</span>
                  <button
                    onClick={() => incrementQty(item.productId)}
                    className="rounded-md border border-black/10 p-1 hover:bg-black/5"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-1 rounded-md p-1 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 space-y-2 border-t border-black/5 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-ink-900/60">Subtotal</span>
            <span>{sub.toFixed(2)} ETB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-900/60">Discount</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-24 rounded-md border border-black/10 px-2 py-1 text-right text-sm outline-none focus:border-forest-700"
            />
          </div>
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-gold-600">
              <span>Points discount ({pointsToUse} pts)</span>
              <span>-{pointsDiscount.toFixed(2)} ETB</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-900/60">Tax</span>
            <input
              type="number"
              min="0"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="w-24 rounded-md border border-black/10 px-2 py-1 text-right text-sm outline-none focus:border-forest-700"
            />
          </div>
          <div className="flex justify-between border-t border-black/5 pt-2 text-base font-bold text-forest-950">
            <span>Total</span>
            <span>{total.toFixed(2)} ETB</span>
          </div>
          {pointsToEarn > 0 && items.length > 0 && (
            <p className="flex items-center justify-end gap-1 text-[11px] text-forest-700">
              <Star size={11} className="fill-gold-500 text-gold-500" />{" "}
              Customer earns {pointsToEarn} points with this sale
            </p>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-900/70">Payment</p>
            <button
              onClick={() => setIsSplit((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                isSplit
                  ? "bg-forest-700 text-white"
                  : "border border-black/10 text-ink-900/60"
              }`}
            >
              <Split size={12} /> Split
            </button>
          </div>

          {!isSplit ? (
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSingleMethod(m.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    singleMethod === m.value
                      ? "border-forest-700 bg-forest-50 text-forest-900"
                      : "border-black/10 text-ink-900/60 hover:bg-black/5"
                  } ${m.value === "customer_credit" ? "col-span-2" : ""}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {splitLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={line.method}
                    onChange={(e) =>
                      updateSplitLine(i, "method", e.target.value)
                    }
                    className="flex-1 rounded-md border border-black/10 px-2 py-1.5 text-xs outline-none"
                  >
                    {methods.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={line.amount}
                    onChange={(e) =>
                      updateSplitLine(i, "amount", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-24 rounded-md border border-black/10 px-2 py-1.5 text-right text-xs outline-none"
                  />
                  {splitLines.length > 1 && (
                    <button
                      onClick={() => removeSplitLine(i)}
                      className="rounded-md p-1 hover:bg-red-50"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSplitLine}
                className="text-xs font-medium text-forest-700 hover:underline"
              >
                + Add another payment line
              </button>
              <p
                className={`text-xs font-medium ${Math.abs(splitRemaining) < 0.01 ? "text-emerald-600" : "text-amber-600"}`}
              >
                {Math.abs(splitRemaining) < 0.01
                  ? "✓ Fully covered"
                  : splitRemaining > 0
                    ? `${splitRemaining.toFixed(2)} ETB remaining`
                    : `${Math.abs(splitRemaining).toFixed(2)} ETB over the total`}
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={!canCharge}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isOnline ? <CheckCircle2 size={16} /> : <CloudOff size={16} />}
          {submitting
            ? "Processing..."
            : isOnline
              ? `Charge ${total.toFixed(2)} ETB`
              : `Save Offline — ${total.toFixed(2)} ETB`}
        </button>
      </div>
    </div>
  );
}

function Receipt({ sale, onNewSale }) {
  const pointsDiscount = sale.pointsDiscount || 0;
  const pointsEarned = sale.pointsEarned || 0;

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center">
      {sale.isOffline ? (
        <>
          <CloudOff size={48} className="mx-auto mb-3 text-amber-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Saved Offline
          </p>
          <p className="mb-6 text-sm text-ink-900/50">
            This sale will sync automatically once you're back online.
          </p>
        </>
      ) : (
        <>
          <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500" />
          <p className="mb-1 text-lg font-bold text-forest-950">
            Payment Successful
          </p>
          {sale.customer && (
            <p className="mb-1 text-sm text-forest-700">
              Customer: {sale.customer.name}
            </p>
          )}
          <p className="mb-6 text-sm text-ink-900/50">
            {new Date(sale.createdAt).toLocaleString()}
          </p>
        </>
      )}

      <div className="mb-4 space-y-2 border-y border-dashed border-black/10 py-4 text-left text-sm">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>
              {(item.lineTotal ?? item.unitPrice * item.quantity).toFixed(2)}{" "}
              ETB
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4 space-y-1 text-sm">
        <div className="flex justify-between text-ink-900/60">
          <span>Subtotal</span>
          <span>{sale.subtotal.toFixed(2)} ETB</span>
        </div>
        <div className="flex justify-between text-ink-900/60">
          <span>Discount</span>
          <span>-{sale.discount.toFixed(2)} ETB</span>
        </div>
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-gold-600">
            <span>Points discount ({sale.pointsRedeemed} pts)</span>
            <span>-{pointsDiscount.toFixed(2)} ETB</span>
          </div>
        )}
        <div className="flex justify-between text-ink-900/60">
          <span>Tax</span>
          <span>+{sale.tax.toFixed(2)} ETB</span>
        </div>
        <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold text-forest-950">
          <span>Total</span>
          <span>{sale.total.toFixed(2)} ETB</span>
        </div>
      </div>

      <div className="mb-4 space-y-1 border-t border-dashed border-black/10 pt-3 text-left text-xs text-ink-900/60">
        <p className="mb-1 font-medium text-ink-900/80">Paid via:</p>
        {sale.payments.map((p, i) => (
          <div key={i} className="flex justify-between capitalize">
            <span>{p.method.replace("_", " ")}</span>
            <span>{p.amount.toFixed(2)} ETB</span>
          </div>
        ))}
      </div>

      {pointsEarned > 0 && (
        <p className="mb-5 flex items-center justify-center gap-1.5 rounded-xl bg-gold-500/15 py-2 text-sm font-medium text-forest-900">
          <Star size={14} className="fill-gold-500 text-gold-500" /> +
          {pointsEarned} loyalty points earned
        </p>
      )}

      <button
        onClick={onNewSale}
        className="w-full rounded-full bg-gold-500 py-2.5 text-sm font-semibold text-forest-950 hover:bg-gold-600"
      >
        New Sale
      </button>
    </div>
  );
}
