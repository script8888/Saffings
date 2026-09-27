import type { Wallet } from "../types";
import { totals } from "./wallet";

/** Quotes a cell only when it holds a comma, quote or line break, doubling inner quotes. */
function cell(value: string | number): string {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Every record across all wallets, oldest first so it reads in the same order
 * as a bank statement. Local date and time; amounts stay bare numbers so a
 * spreadsheet can sum them. Ends with the month's total budget under Amount.
 */
export function monthCsv(wallets: Wallet[]): string {
  const rows = wallets
    .flatMap((w) => w.tx.map((t) => ({ ...t, category: w.name })))
    .sort((a, b) => a.date - b.date)
    .map((t) => {
      const d = new Date(t.date);
      return [
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        t.category,
        t.note,
        t.amt,
      ]
        .map(cell)
        .join(",");
    });
  // The blank line keeps the total out of the range a spreadsheet sorts or filters.
  const budget = `,,,Total budget,${totals(wallets).budget}`;
  return ["Date,Time,Category,Note,Amount", ...rows, "", budget].join("\r\n");
}
