import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { getCachedProducts } from "../../offline/db";
import { Field, Segmented, CopyButton, Stat, num } from "./ui";
import { formatMoney, formatNumber } from "../../lib/calcEngine";

const BASES = [
  { id: "margin", label: "Margin %" },
  { id: "markup", label: "Markup %" },
  { id: "price", label: "Price" },
];

export default function PricingMode() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [cost, setCost] = useState("");
  const [basis, setBasis] = useState("margin");
  const [value, setValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await api.get("/products");
        if (!cancelled) setProducts(data);
      } catch {
        const cached = await getCachedProducts().catch(() => []);
        if (!cancelled) setProducts(cached);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const product = products.find((p) => p._id === productId);

  function chooseProduct(id) {
    setProductId(id);
    const chosen = products.find((p) => p._id === id);
    if (!chosen) return;
    setCost(String(chosen.costPrice));
    setBasis("price");
    setValue(String(chosen.sellingPrice));
  }

  const costAmount = num(cost);
  const entered = num(value);
  let price = null;

  if (cost !== "" && value !== "") {
    if (basis === "margin")
      price = entered < 100 ? costAmount / (1 - entered / 100) : null;
    else if (basis === "markup") price = costAmount * (1 + entered / 100);
    else price = entered;
  }

  const profit = price === null ? null : price - costAmount;
  const margin = price !== null && price > 0 ? (profit / price) * 100 : 0;
  const markup =
    price !== null && costAmount > 0 ? (profit / costAmount) * 100 : null;
  const losing = profit !== null && profit <= 0;

  const stock = product ? product.currentStock : 0;
  const currentProfit = product
    ? (product.sellingPrice - product.costPrice) * stock
    : 0;
  const newProfit = profit === null ? 0 : profit * stock;
  const delta = newProfit - currentProfit;

  const valueSuffix = basis === "price" ? "ETB" : "%";
  const valueLabel =
    basis === "margin"
      ? "Target margin"
      : basis === "markup"
        ? "Target markup"
        : "Selling price";

  return (
    <div className="space-y-4 pt-2">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/50">
          Product
        </span>
        <select
          value={productId}
          onChange={(e) => chooseProduct(e.target.value)}
          className="w-full rounded-xl bg-black/20 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 transition focus:ring-gold-500/70"
        >
          <option value="" className="text-ink-900">
            Type a cost manually
          </option>
          {[...products]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <option key={p._id} value={p._id} className="text-ink-900">
                {p.name}
              </option>
            ))}
        </select>
      </label>

      {product && (
        <p className="-mt-1 px-1 text-xs text-white/50">
          Cost {formatMoney(product.costPrice)} · Price{" "}
          {formatMoney(product.sellingPrice)} · {product.currentStock} in stock
        </p>
      )}

      <Field
        label="Cost per unit"
        value={cost}
        onChange={setCost}
        suffix="ETB"
      />

      <div className="space-y-2">
        <Segmented options={BASES} value={basis} onChange={setBasis} />
        <Field
          label={valueLabel}
          value={value}
          onChange={setValue}
          suffix={valueSuffix}
        />
        {basis === "margin" && entered >= 100 && (
          <p className="px-1 text-xs text-red-300">
            Margin has to be below 100%.
          </p>
        )}
      </div>

      {price === null ? (
        <div className="rounded-2xl bg-white/5 p-5 text-center text-sm text-white/55 ring-1 ring-white/10">
          Enter a cost and a {valueLabel.toLowerCase()} to see your selling
          price and profit.
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`rounded-2xl p-5 ring-1 ${
              losing
                ? "bg-red-400/10 ring-red-400/20"
                : "bg-gradient-to-br from-gold-500/20 to-gold-500/5 ring-gold-500/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-[11px] font-medium uppercase tracking-wider ${losing ? "text-red-300/80" : "text-gold-500/80"}`}
                >
                  Selling price
                </p>
                <p
                  className={`mt-1 text-5xl font-bold tabular-nums ${losing ? "text-red-300" : "text-gold-500"}`}
                >
                  {formatMoney(price)}
                </p>
                <p
                  className={`text-xs ${losing ? "text-red-300/60" : "text-gold-500/60"}`}
                >
                  ETB per unit
                </p>
              </div>
              <CopyButton text={Number(price.toFixed(2))} />
            </div>

            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    losing
                      ? "bg-red-400"
                      : "bg-gradient-to-r from-emerald-400 to-gold-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Stat
              label="Profit / unit"
              value={formatMoney(profit)}
              tone={losing ? "bad" : "good"}
            />
            <Stat
              label="Margin"
              value={`${formatNumber(margin, 1)}%`}
              tone={losing ? "bad" : "plain"}
            />
            <Stat
              label="Markup"
              value={markup === null ? "-" : `${formatNumber(markup, 1)}%`}
            />
          </div>

          {losing && (
            <p className="rounded-xl bg-red-400/10 px-4 py-3 text-xs text-red-300 ring-1 ring-red-400/20">
              At this price you make no profit on each unit.
            </p>
          )}

          {product && (
            <div className="space-y-2 rounded-2xl bg-white/5 p-4 text-sm ring-1 ring-white/10">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                If all {stock} in stock sell
              </p>
              <div className="flex justify-between">
                <span className="text-white/60">At today's price</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(currentProfit)} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">At this price</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(newProfit)} ETB
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white/60">Difference</span>
                <span
                  className={`font-bold tabular-nums ${delta >= 0 ? "text-emerald-300" : "text-red-300"}`}
                >
                  {delta >= 0 ? "+" : ""}
                  {formatMoney(delta)} ETB
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
