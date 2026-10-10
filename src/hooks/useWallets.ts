import { useEffect, useRef, useState } from "react";
import type { AppState, WalletDraft } from "../types";
import { currentMonth } from "../lib/format";
import { makeId } from "../lib/id";
import { saveState, watchState } from "../lib/storage";

/** The signed-in user's wallets, or null until Firestore has loaded them. */
export function useWallets(uid: string) {
  const [state, setState] = useState<AppState | null>(null);
  // The last state Firestore sent, so it isn't written straight back.
  const fromServer = useRef<AppState | null>(null);

  useEffect(
    () =>
      watchState(
        uid,
        (next) => {
          fromServer.current = next;
          setState(next);
        },
        (e) => alert(`Couldn't load your data: ${e.message}`),
      ),
    [uid],
  );

  useEffect(() => {
    if (!state || state === fromServer.current) return;
    saveState(uid, state).catch((e: Error) =>
      alert(`Couldn't save your last change: ${e.message}`),
    );
  }, [uid, state]);

  function update(fn: (s: AppState) => AppState) {
    setState((s) => s && fn(s));
  }

  function mapWallet(id: string, fn: (w: AppState["cats"][number]) => AppState["cats"][number]) {
    update((s) => ({
      ...s,
      cats: s.cats.map((w) => (w.id === id ? fn(w) : w)),
    }));
  }

  if (!state) return null;

  return {
    state,

    addWallet(draft: WalletDraft) {
      update((s) => ({
        ...s,
        cats: [...s.cats, { id: makeId(), ...draft, tx: [], settledAt: 0 }],
      }));
    },

    updateWallet(id: string, draft: WalletDraft) {
      mapWallet(id, (w) => ({ ...w, ...draft }));
    },

    deleteWallet(id: string) {
      update((s) => ({ ...s, cats: s.cats.filter((w) => w.id !== id) }));
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
      update((s) => ({ ...s, weekStart: day }));
    },

    /** Clears every record but keeps the wallets and their budgets. */
    startNewMonth() {
      update((s) => ({
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
