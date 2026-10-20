export function normalizePhone(input) {
  let value = String(input ?? "").replace(/[\s\-().]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (!/^\+?\d+$/.test(value)) return null;

  let national;
  if (value.startsWith("+251")) national = value.slice(4);
  else if (value.startsWith("251")) national = value.slice(3);
  else if (value.startsWith("0")) national = value.slice(1);
  else national = value;

  return /^[79]\d{8}$/.test(national) ? `+251${national}` : null;
}

export function formatPhone(e164) {
  const match = /^\+251(\d{3})(\d{3})(\d{3})$/.exec(e164 || "");
  return match ? `+251 ${match[1]} ${match[2]} ${match[3]}` : e164;
}
