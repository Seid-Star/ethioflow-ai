export const NOTES = [200, 100, 50, 10, 5, 1];

export const round2 = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function breakChange(amount) {
  const cents = Math.round(amount * 100);
  let whole = Math.floor(cents / 100);
  const santim = cents % 100;
  const notes = [];

  for (const value of NOTES) {
    const count = Math.floor(whole / value);
    if (count > 0) {
      notes.push({ value, count });
      whole -= count * value;
    }
  }

  return { notes, santim };
}

export function quickAmounts(due) {
  if (!(due > 0)) return [];
  const steps = [10, 50, 100, 200, 500, 1000];
  const amounts = [due];

  for (const step of steps) {
    const value = Math.ceil(due / step) * step;
    if (!amounts.includes(value)) amounts.push(value);
  }

  return amounts.slice(0, 5);
}
