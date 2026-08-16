import { useEffect, useState } from "react";
import type { AppState, WalletDraft } from "../types";
import { currentMonth } from "../lib/format";
import { makeId } from "../lib/id";
import { loadState, saveState } from "../lib/storage";

export function useWallets() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  function mapWallet(id: string, fn: (w: AppState["cats"][number]) => AppState["cats"][number]) {
    setState((s) => ({
      ...s,
      cats: s.cats.map((w) => (w.id === id ? fn(w) : w)),
    }));
  }

  return {
    state,

    addWallet(draft: WalletDraft) {
      setState((s) => ({
        ...s,
        cats: [...s.cats, { id: makeId(), ...draft, tx: [], settledAt: 0 }],
      }));
    },

    updateWallet(id: string, draft: WalletDraft) {
      mapWallet(id, (w) => ({ ...w, ...draft }));
    },

    deleteWallet(id: string) {
      setState((s) => ({ ...s, cats: s.cats.filter((w) => w.id !== id) }));
    },

    addTransaction(walletId: string, amt: number, note: string) {
      mapWallet(walletId, (w) => ({
        ...w,
        tx: [{ id: makeId(), amt, note, date: Date.now() }, ...w.tx],
      }));
    },

    deleteTransaction(walletId: string, txId: string) {
      mapWallet(walletId, (w) => ({
        ...w,
        tx: w.tx.filter((t) => t.id !== txId),
      }));
    },

    /** Restarts this wallet's weekly figure from now, without deleting anything. */
    markWithdrawn(walletId: string) {
      mapWallet(walletId, (w) => ({ ...w, settledAt: Date.now() }));
    },

    setWeekStart(day: number) {
      setState((s) => ({ ...s, weekStart: day }));
    },

    /** Clears every record but keeps the wallets and their budgets. */
    startNewMonth() {
      setState((s) => ({
        ...s,
        month: currentMonth(),
        cats: s.cats.map((w) => ({ ...w, tx: [], settledAt: 0 })),
      }));
    },

    replaceState(next: AppState) {
      setState(next);
    },
  };
}
