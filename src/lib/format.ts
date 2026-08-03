const NF = new Intl.NumberFormat("en-NG");

export function formatNumber(n: number): string {
  return NF.format(n);
}

export function formatNaira(n: number): string {
  return "₦" + NF.format(Math.round(n));
}

/** Renders negatives as "-₦1,200" rather than "₦-1,200". */
export function formatSigned(n: number): string {
  return n < 0 ? "-" + formatNaira(Math.abs(n)) : formatNaira(n);
}

export function currentMonth(): string {
  return new Date().toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

export function formatTxDate(ts: number): string {
  const d = new Date(ts);
  const day = d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}
