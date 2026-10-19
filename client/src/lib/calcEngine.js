class CalcError extends Error {
  constructor(message, friendly = null) {
    super(message);
    this.friendly = friendly;
  }
}

const SYMBOLS = { "×": "*", "÷": "/", "−": "-" };

export function evaluate(input) {
  const src = String(input)
    .replace(/[×÷−]/g, (c) => SYMBOLS[c])
    .replace(/\s+/g, "");

  if (!src) return { ok: false, error: null };

  let i = 0;
  const peek = () => src[i];

  const readNumber = () => {
    const match = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
    if (!match) throw new CalcError("number expected");
    i += match[0].length;
    return parseFloat(match[0]);
  };

  const factor = () => {
    if (peek() === "-") {
      i += 1;
      const inner = factor();
      return { value: -inner.value, percent: inner.percent };
    }
    if (peek() === "+") {
      i += 1;
      return factor();
    }

    let node;
    if (peek() === "(") {
      i += 1;
      const inner = expression();
      if (peek() !== ")") throw new CalcError("missing bracket");
      i += 1;
      node = { value: inner.value, percent: false };
    } else {
      node = { value: readNumber(), percent: false };
    }

    while (peek() === "%") {
      i += 1;
      node = { value: node.value / 100, percent: true };
    }
    return node;
  };

  const term = () => {
    let left = factor();
    while (peek() === "*" || peek() === "/") {
      const operator = src[i];
      i += 1;
      const right = factor();
      if (operator === "*") {
        left = { value: left.value * right.value, percent: false };
      } else {
        if (right.value === 0)
          throw new CalcError("division by zero", "Cannot divide by zero");
        left = { value: left.value / right.value, percent: false };
      }
    }
    return left;
  };

  const expression = () => {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const operator = src[i];
      i += 1;
      const right = term();
      const amount = right.percent ? left.value * right.value : right.value;
      left = {
        value: operator === "+" ? left.value + amount : left.value - amount,
        percent: false,
      };
    }
    return left;
  };

  try {
    const result = expression();
    if (i !== src.length) throw new CalcError("unexpected input");
    if (!Number.isFinite(result.value))
      throw new CalcError("overflow", "That number is too large");
    return { ok: true, value: Number(result.value.toPrecision(12)) };
  } catch (err) {
    return { ok: false, error: err instanceof CalcError ? err.friendly : null };
  }
}

export function formatNumber(value, maxDecimals = 8) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatMoney(value) {
  return formatNumber(value, 2);
}

export function toRaw(value) {
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 10,
  });
}

export function autoClose(expression) {
  const open = (expression.match(/\(/g) || []).length;
  const close = (expression.match(/\)/g) || []).length;
  return expression + ")".repeat(Math.max(0, open - close));
}

export function formatExpression(expression) {
  return expression
    .replace(/\d+(\.\d*)?/g, (match) => {
      const [whole, decimals] = match.split(".");
      const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return decimals === undefined ? grouped : `${grouped}.${decimals}`;
    })
    .replace(/-/g, "−");
}
