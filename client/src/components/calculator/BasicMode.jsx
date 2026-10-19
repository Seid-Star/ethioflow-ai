import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Delete, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  evaluate,
  formatExpression,
  formatNumber,
  autoClose,
  toRaw,
} from "../../lib/calcEngine";
import { ZigZag, CopyButton } from "./ui";

const OPERATORS = ["+", "−", "-", "×", "÷"];
const ENDS_OPERAND = /[0-9)%]/;

const initialState = { expr: "", done: null, error: null };
const next = (expr) => ({ expr, done: null, error: null });
const lastNumber = (expr) => /(\d*\.?\d*)$/.exec(expr)[1];

function reducer(state, action) {
  switch (action.type) {
    case "clear":
      return initialState;
    case "load":
      return next(action.value);
    case "digit": {
      let expr = state.done ? "" : state.expr;
      const last = expr.slice(-1);
      if (last === ")" || last === "%") expr += "×";
      if (lastNumber(expr) === "0") expr = expr.slice(0, -1);
      return next(expr + action.value);
    }
    case "dot": {
      let expr = state.done ? "" : state.expr;
      const last = expr.slice(-1);
      if (last === ")" || last === "%") expr += "×";
      const token = lastNumber(expr);
      if (token.includes(".")) return state;
      return next(expr + (token === "" ? "0." : "."));
    }
    case "op": {
      const expr = state.expr;
      const last = expr.slice(-1);
      if (expr === "") return action.value === "−" ? next("-") : state;
      if (expr === "-") return state;
      if (OPERATORS.includes(last))
        return next(expr.slice(0, -1) + action.value);
      if (last === "(") return action.value === "−" ? next(expr + "−") : state;
      return next(expr + action.value);
    }
    case "percent": {
      if (/[0-9)]/.test(state.expr.slice(-1))) return next(state.expr + "%");
      return state;
    }
    case "paren": {
      const expr = state.done ? "" : state.expr;
      const open = (expr.match(/\(/g) || []).length;
      const close = (expr.match(/\)/g) || []).length;
      const afterOperand = ENDS_OPERAND.test(expr.slice(-1));
      const wantClose =
        action.value === "close" ||
        (action.value === undefined && open > close && afterOperand);
      if (wantClose)
        return open > close && afterOperand ? next(expr + ")") : state;
      return next(expr + (afterOperand ? "×(" : "("));
    }
    case "back":
      return next(state.expr.slice(0, -1));
    case "equals": {
      if (state.done || state.expr === "") return state;
      const closed = autoClose(state.expr);
      const result = evaluate(closed);
      if (!result.ok) return { ...state, error: result.error };
      return {
        expr: toRaw(result.value),
        done: { expr: closed, result: result.value },
        error: null,
      };
    }
    default:
      return state;
  }
}

const TONES = {
  num: "bg-white/10 text-white hover:bg-white/15",
  fn: "bg-white/5 text-gold-500 hover:bg-white/10",
  op: "bg-gold-500/15 text-gold-500 hover:bg-gold-500/25",
  danger: "bg-red-400/15 text-red-300 hover:bg-red-400/25",
  eq: "bg-gradient-to-b from-gold-500 to-gold-600 text-forest-950 shadow-lg shadow-gold-500/20 hover:brightness-110",
};

const digit = (value) => ({
  label: value,
  action: { type: "digit", value },
  tone: "num",
});

const KEYS = [
  { label: "AC", action: { type: "clear" }, tone: "danger", aria: "Clear all" },
  { label: "( )", action: { type: "paren" }, tone: "fn", aria: "Brackets" },
  { label: "%", action: { type: "percent" }, tone: "fn", aria: "Percent" },
  {
    label: "÷",
    action: { type: "op", value: "÷" },
    tone: "op",
    aria: "Divide",
  },
  digit("7"),
  digit("8"),
  digit("9"),
  {
    label: "×",
    action: { type: "op", value: "×" },
    tone: "op",
    aria: "Multiply",
  },
  digit("4"),
  digit("5"),
  digit("6"),
  {
    label: "−",
    action: { type: "op", value: "−" },
    tone: "op",
    aria: "Subtract",
  },
  digit("1"),
  digit("2"),
  digit("3"),
  { label: "+", action: { type: "op", value: "+" }, tone: "op", aria: "Add" },
  digit("0"),
  { label: ".", action: { type: "dot" }, tone: "num", aria: "Decimal point" },
  {
    label: <Delete size={20} />,
    action: { type: "back" },
    tone: "fn",
    aria: "Backspace",
  },
  { label: "=", action: { type: "equals" }, tone: "eq", aria: "Equals" },
];

function readTape(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-60) : [];
  } catch {
    return [];
  }
}

function writeTape(key, tape) {
  try {
    localStorage.setItem(key, JSON.stringify(tape.slice(-60)));
  } catch {
    return;
  }
}

export default function BasicMode({ active }) {
  const userId = useAuthStore((s) => s.user?.id);
  const storageKey = `ethioflow-calculator-tape:${userId || "guest"}`;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tape, setTape] = useState(() => readTape(storageKey));
  const [showTape, setShowTape] = useState(() => window.innerHeight >= 740);
  const tapeRef = useRef(null);

  useEffect(() => {
    writeTape(storageKey, tape);
  }, [storageKey, tape]);

  useEffect(() => {
    if (!state.done) return;
    setTape((current) =>
      [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          expr: state.done.expr,
          result: state.done.result,
        },
      ].slice(-60),
    );
  }, [state.done]);

  useEffect(() => {
    if (tapeRef.current)
      tapeRef.current.scrollTop = tapeRef.current.scrollHeight;
  }, [tape.length, showTape]);

  useEffect(() => {
    if (!active) return undefined;

    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable
      )
        return;

      const k = e.key;
      let action = null;
      if (/^[0-9]$/.test(k)) action = { type: "digit", value: k };
      else if (k === "." || k === ",") action = { type: "dot" };
      else if (k === "+") action = { type: "op", value: "+" };
      else if (k === "-") action = { type: "op", value: "−" };
      else if (k === "*" || k === "x" || k === "X")
        action = { type: "op", value: "×" };
      else if (k === "/") action = { type: "op", value: "÷" };
      else if (k === "%") action = { type: "percent" };
      else if (k === "(") action = { type: "paren", value: "open" };
      else if (k === ")") action = { type: "paren", value: "close" };
      else if (k === "Enter" || k === "=") action = { type: "equals" };
      else if (k === "Backspace") action = { type: "back" };
      else if (k === "Delete" || k === "c" || k === "C")
        action = { type: "clear" };

      if (!action) return;
      e.preventDefault();
      dispatch(action);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const preview = useMemo(() => {
    if (state.done || !/[+−×÷%()-]/.test(state.expr.replace(/^-/, "")))
      return null;
    const result = evaluate(autoClose(state.expr));
    return result.ok ? result.value : null;
  }, [state.expr, state.done]);

  const tapeTotal = useMemo(
    () =>
      Number(
        tape.reduce((sum, entry) => sum + entry.result, 0).toPrecision(12),
      ),
    [tape],
  );

  const main = state.done
    ? formatNumber(state.done.result)
    : formatExpression(state.expr) || "0";
  const sub = state.error
    ? state.error
    : state.done
      ? `${formatExpression(state.done.expr)} =`
      : preview !== null
        ? `= ${formatNumber(preview)}`
        : "";
  const copyValue = state.done ? state.done.result : (preview ?? "");
  const sizeClass =
    main.length <= 9
      ? "text-5xl"
      : main.length <= 13
        ? "text-4xl"
        : main.length <= 19
          ? "text-3xl"
          : "text-2xl";

  return (
    <div className="space-y-4 pt-2">
      <div>
        {showTape && (
          <div>
            <div
              ref={tapeRef}
              className="max-h-32 min-h-16 overflow-y-auto rounded-t-xl bg-cream-50 px-4 py-3 font-mono text-[13px] text-ink-900"
            >
              {tape.length === 0 ? (
                <p className="py-2 text-center text-xs text-ink-900/40">
                  Every calculation prints here, like a paper tape.
                </p>
              ) : (
                tape.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() =>
                      dispatch({ type: "load", value: toRaw(entry.result) })
                    }
                    title="Use this result"
                    className="flex w-full items-baseline justify-between gap-3 rounded px-1 py-0.5 text-left transition hover:bg-forest-100"
                  >
                    <span className="truncate text-ink-900/50">
                      {formatExpression(entry.expr)}
                    </span>
                    <span className="shrink-0 font-bold">
                      {formatNumber(entry.result)}
                    </span>
                  </button>
                ))
              )}
            </div>
            <ZigZag className="text-cream-50" />
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/50">
          <button
            type="button"
            onClick={() => setShowTape((value) => !value)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-white/10 hover:text-white"
          >
            {showTape ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Tape {tape.length > 0 && `(${tape.length})`}
          </button>

          {tape.length > 0 && (
            <div className="flex items-center gap-1">
              <span>
                Total <b className="text-gold-500">{formatNumber(tapeTotal)}</b>
              </span>
              <CopyButton text={tapeTotal} />
              <button
                type="button"
                onClick={() => setTape([])}
                aria-label="Clear tape"
                className="flex h-8 items-center rounded-lg px-2 text-white/60 transition hover:bg-white/10 hover:text-red-300"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-black/25 px-5 py-4 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3">
          <CopyButton text={copyValue} className="mt-1" />
          <div className="min-w-0 flex-1 text-right">
            <p
              className={`min-h-5 truncate text-sm ${state.error ? "text-red-300" : "text-white/45"}`}
            >
              {sub}
            </p>
            <p
              className={`mt-1 break-all font-semibold leading-tight tracking-tight tabular-nums ${sizeClass}`}
            >
              {main}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {KEYS.map((key, index) => (
          <button
            key={index}
            type="button"
            aria-label={key.aria}
            onClick={() => dispatch(key.action)}
            className={`flex h-14 select-none items-center justify-center rounded-2xl text-xl font-medium transition duration-100 active:scale-95 ${TONES[key.tone]}`}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}
