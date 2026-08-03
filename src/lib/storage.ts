import type { AppState, Transaction, Wallet } from "../types";
import { currentMonth } from "./format";
import { makeId } from "./id";

const KEY = "wallets_v1";

// The only place that touches persistence. Swapping localStorage for an API
// means reimplementing loadState/saveState here and nothing else.

function defaultState(): AppState {
  return {
    month: currentMonth(),
    cats: [
      { id: makeId(), name: "Flexing", budget: 0, color: "#B23A2E", tx: [] },
      { id: makeId(), name: "Food", budget: 0, color: "#14654B", tx: [] },
      { id: makeId(), name: "Utilities", budget: 0, color: "#C77A15", tx: [] },
      { id: makeId(), name: "Light bill", budget: 0, color: "#2E5A9E", tx: [] },
      { id: makeId(), name: "Fuel", budget: 0, color: "#4A4A4A", tx: [] },
    ],
  };
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeTx(raw: unknown): Transaction {
  const t = (raw ?? {}) as Partial<Transaction>;
  return {
    id: typeof t.id === "string" ? t.id : makeId(),
    amt: num(t.amt),
    note: typeof t.note === "string" ? t.note : "",
    date: num(t.date) || Date.now(),
  };
}

function normalizeWallet(raw: unknown): Wallet {
  const w = (raw ?? {}) as Partial<Wallet>;
  return {
    id: typeof w.id === "string" ? w.id : makeId(),
    name: typeof w.name === "string" ? w.name : "Untitled",
    budget: num(w.budget),
    color: typeof w.color === "string" ? w.color : "#14654B",
    tx: Array.isArray(w.tx) ? w.tx.map(normalizeTx) : [],
  };
}

/**
 * Coerces untrusted JSON (localStorage or a restored backup file) into a usable
 * AppState. Returns null when the shape is too broken to be a backup at all.
 */
export function normalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<AppState>;
  if (!Array.isArray(s.cats)) return null;
  return {
    month: typeof s.month === "string" && s.month ? s.month : currentMonth(),
    cats: s.cats.map(normalizeWallet),
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return normalizeState(JSON.parse(raw)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private-mode Safari and a full quota both throw; losing the write is
    // better than crashing mid-entry.
  }
}
