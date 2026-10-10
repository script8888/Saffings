import { doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import type { AppState, Transaction, Wallet } from "../types";
import { db } from "./firebase";
import { currentMonth } from "./format";
import { makeId } from "./id";

/** Where the app kept everything before accounts existed. */
const LOCAL_KEY = "wallets_v1";

// The only place that touches persistence. Each user's whole state is one
// Firestore document, which the existing users/{uid}/** rule already guards.

function defaultState(): AppState {
  return {
    month: currentMonth(),
    weekStart: 0,
    cats: [
      seed("Flexing", "#B23A2E"),
      seed("Food", "#14654B"),
      seed("Utilities", "#C77A15"),
      seed("Light bill", "#2E5A9E"),
      seed("Fuel", "#4A4A4A"),
    ],
  };
}

function seed(name: string, color: string): Wallet {
  return { id: makeId(), name, budget: 0, color, tx: [], settledAt: 0 };
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Anything that isn't a whole 0-6 falls back to Sunday. */
function clampDay(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6
    ? value
    : 0;
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
    settledAt: num(w.settledAt),
  };
}

/**
 * Coerces untrusted JSON (Firestore, old localStorage data or a restored backup
 * file) into a usable AppState. Returns null when the shape is too broken to be
 * a backup at all.
 */
export function normalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<AppState>;
  if (!Array.isArray(s.cats)) return null;
  return {
    month: typeof s.month === "string" && s.month ? s.month : currentMonth(),
    weekStart: clampDay(s.weekStart),
    cats: s.cats.map(normalizeWallet),
  };
}

function stateDoc(uid: string) {
  return doc(db, "users", uid, "saffings", "state");
}

function readLocalState(): AppState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/**
 * Streams the user's state from Firestore. On an account's first sign-in, data
 * this device saved before accounts existed is uploaded, and cleared from the
 * device only once the server has confirmed the write.
 */
export function watchState(
  uid: string,
  onState: (state: AppState) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const ref = stateDoc(uid);
  return onSnapshot(
    ref,
    (snap) => {
      // Our own writes echo back before the server confirms them, and the UI
      // already shows them.
      if (snap.metadata.hasPendingWrites) return;
      if (snap.exists()) {
        onState(normalizeState(snap.data()) ?? defaultState());
        return;
      }
      // The offline cache not knowing the doc doesn't mean the server lacks it;
      // uploading now could overwrite real data. Wait for the server's answer.
      if (snap.metadata.fromCache) return;

      const initial = readLocalState() ?? defaultState();
      onState(initial);
      setDoc(ref, initial)
        .then(() => localStorage.removeItem(LOCAL_KEY))
        .catch(onError);
    },
    onError,
  );
}

// ponytail: whole-document last write wins. A device that edits before its
// listener catches up overwrites the other device's newer changes; move to
// per-wallet documents if that ever bites.
export function saveState(uid: string, state: AppState): Promise<void> {
  return setDoc(stateDoc(uid), state);
}
