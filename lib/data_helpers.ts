// lib/data.ts
// ============================================================
// HELPER UTILITIES
// ============================================================

/** Format a tolerance from plus/minus values */
export function formatTolerance(
  plus: number | null,
  minus: number | null,
): string {
  if (plus === null && minus === null) return "-";
  const p = plus !== null ? (plus >= 0 ? `+${plus}` : `${plus}`) : "+0";
  const m = minus !== null ? `${minus}` : "-0";
  return `${p} / ${m}`;
}

/** Format a dimension type slug into a readable label */
export function formatDimensionType(dimType: string): string {
  return dimType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format time in minutes to display string */
export function formatTime(minutes: number): string {
  return `${minutes.toFixed(2)} min`;
}

/** Format currency (INR) */
export function formatCurrency(
  value: number,
  currency: string = "INR",
): string {
  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$";
  return `${symbol}${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Get the machine family display label */
export function formatMachineFamily(family: string): string {
  return family.replace(/_/g, " ").toUpperCase();
}
