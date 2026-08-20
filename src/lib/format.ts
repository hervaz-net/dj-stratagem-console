import { format, parseISO, isValid } from "date-fns";

export function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    const digits = n >= 10 ? 0 : 1;
    return `${sign}$${n.toFixed(digits)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}$${Math.round(abs / 1000)}K`;
  }
  return `${sign}${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(abs)}`;
}

export function formatUsdFull(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  const d = parseISO(value);
  if (!isValid(d)) return value;
  return format(d, "MMM d, yyyy");
}

export function formatShortDate(value: string): string {
  const d = parseISO(value);
  if (!isValid(d)) return value;
  return format(d, "MMM d");
}
