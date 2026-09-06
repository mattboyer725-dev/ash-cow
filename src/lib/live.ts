import type { CashCow, HourBeat } from "./types";

export function elapsedHours(startedAt: number, now = Date.now()) {
  return Math.max(0, (now - startedAt) / (60 * 60 * 1000));
}

export function currentBeat(cow: CashCow, startedAt: number | undefined, now = Date.now()): HourBeat | null {
  if (!startedAt) return null;
  const h = elapsedHours(startedAt, now);
  const due = cow.hours.filter((beat) => beat.hour <= h);
  return due[due.length - 1] ?? cow.hours[0] ?? null;
}

export function nextBeat(cow: CashCow, startedAt: number | undefined, now = Date.now()): HourBeat | null {
  if (!startedAt) return cow.hours[0] ?? null;
  const h = elapsedHours(startedAt, now);
  return cow.hours.find((beat) => beat.hour > h) ?? null;
}
