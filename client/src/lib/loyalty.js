export const ETB_PER_POINT = 0.5;
export const POINTS_PER_ETB = 0.1;

export function pointsEarnedFor(amount) {
  return Math.floor(amount * POINTS_PER_ETB);
}
