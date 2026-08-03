import type { Wallet } from "../types";

export const COLORS = [
  "#14654B",
  "#B23A2E",
  "#C77A15",
  "#2E5A9E",
  "#7A3E9E",
  "#1E7A4C",
  "#B0872B",
  "#4A4A4A",
];

export function spentOf(wallet: Wallet): number {
  return wallet.tx.reduce((sum, t) => sum + t.amt, 0);
}

export function leftOf(wallet: Wallet): number {
  return wallet.budget - spentOf(wallet);
}

export function totals(wallets: Wallet[]): { budget: number; spent: number; left: number } {
  const budget = wallets.reduce((sum, w) => sum + w.budget, 0);
  const spent = wallets.reduce((sum, w) => sum + spentOf(w), 0);
  return { budget, spent, left: budget - spent };
}

/** Amber past 85% of budget, red once over — matches the card amount colour. */
export function barColorOf(wallet: Wallet): string {
  const spent = spentOf(wallet);
  if (spent > wallet.budget) return "#B23A2E";
  const pct = wallet.budget > 0 ? (spent / wallet.budget) * 100 : 0;
  return pct > 85 ? "#C77A15" : wallet.color;
}

export function barPctOf(wallet: Wallet): number {
  if (wallet.budget <= 0) return 0;
  return Math.min(100, (spentOf(wallet) / wallet.budget) * 100);
}
