import { useState } from "react";
import { Field, Segmented, CopyButton, Stat, num } from "./ui";
import { formatMoney } from "../../lib/calcEngine";

const VAT_MODES = [
  { id: "add", label: "Add VAT" },
  { id: "remove", label: "Remove VAT" },
];

const DISCOUNTS = [5, 10, 15, 20, 25, 50];

export default function TaxMode() {
  const [vatAmount, setVatAmount] = useState("");
  const [vatRate, setVatRate] = useState("15");
  const [vatMode, setVatMode] = useState("add");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const rate = num(vatRate) / 100;
  const amount = num(vatAmount);
  let net = 0;
  let gross = 0;
  let vat = 0;

  if (vatMode === "add") {
    net = amount;
    vat = net * rate;
    gross = net + vat;
  } else {
    gross = amount;
    net = gross / (1 + rate);
    vat = gross - net;
  }

  const percent = Math.min(100, num(discount));
  const original = num(price);
  const saved = (original * percent) / 100;
  const toPay = original - saved;

  return (
    <div className="space-y-6 pt-2">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-500">
          VAT
        </p>
        <Segmented options={VAT_MODES} value={vatMode} onChange={setVatMode} />
        <div className="grid grid-cols-[1fr_6.5rem] gap-3">
          <Field
            label={vatMode === "add" ? "Price before VAT" : "Price with VAT"}
            value={vatAmount}
            onChange={setVatAmount}
            suffix="ETB"
          />
          <Field
            label="Rate"
            value={vatRate}
            onChange={setVatRate}
            suffix="%"
          />
        </div>

        {vatAmount !== "" && (
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Net" value={formatMoney(net)} />
            <Stat label="VAT" value={formatMoney(vat)} tone="gold" />
            <Stat label="Gross" value={formatMoney(gross)} tone="good" />
          </div>
        )}
        {vatAmount !== "" && (
          <div className="flex justify-end">
            <CopyButton
              text={Number((vatMode === "add" ? gross : net).toFixed(2))}
              label={vatMode === "add" ? "Copy total" : "Copy net price"}
            />
          </div>
        )}
        <p className="px-1 text-[11px] text-white/40">
          Starts at 15%. Change the rate to match your invoice.
        </p>
      </section>

      <section className="space-y-3 border-t border-white/10 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-500">
          Discount
        </p>
        <div className="grid grid-cols-[1fr_6.5rem] gap-3">
          <Field label="Price" value={price} onChange={setPrice} suffix="ETB" />
          <Field
            label="Off"
            value={discount}
            onChange={setDiscount}
            suffix="%"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {DISCOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDiscount(String(value))}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition ${
                discount === String(value)
                  ? "bg-gold-500 text-forest-950 ring-gold-500"
                  : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {value}%
            </button>
          ))}
        </div>

        {price !== "" && discount !== "" && (
          <div className="grid grid-cols-2 gap-2.5">
            <Stat
              label="Customer saves"
              value={formatMoney(saved)}
              tone="gold"
            />
            <Stat
              label="Customer pays"
              value={formatMoney(toPay)}
              tone="good"
            />
          </div>
        )}
        {price !== "" && discount !== "" && (
          <div className="flex justify-end">
            <CopyButton text={Number(toPay.toFixed(2))} label="Copy price" />
          </div>
        )}
      </section>
    </div>
  );
}
