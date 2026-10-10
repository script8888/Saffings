import { beforeEach, describe, expect, it, vi } from "vitest";

const firestore = vi.hoisted(() => ({
  emit: (_snap: unknown) => {},
  setDoc: vi.fn(),
}));

vi.mock("./firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: () => ({}),
  setDoc: firestore.setDoc,
  onSnapshot: (_ref: unknown, next: (snap: unknown) => void) => {
    firestore.emit = next;
    return () => {};
  },
}));

import { watchState } from "./storage";

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
});

const LOCAL = {
  month: "2026-10",
  weekStart: 1,
  cats: [{ id: "w1", name: "Food", budget: 300, color: "#14654B", tx: [], settledAt: 0 }],
};
const CLOUD = { ...LOCAL, cats: [{ ...LOCAL.cats[0], id: "cloud", name: "Rent" }] };

function snap(data: unknown, meta: { fromCache?: boolean } = {}) {
  return {
    exists: () => data !== undefined,
    data: () => data,
    metadata: { fromCache: false, hasPendingWrites: false, ...meta },
  };
}

function watch() {
  const onState = vi.fn();
  const onError = vi.fn();
  watchState("uid", onState, onError);
  return { onState, onError };
}

const flush = () => new Promise((r) => setTimeout(r));

describe("watchState", () => {
  beforeEach(() => {
    store.clear();
    store.set("wallets_v1", JSON.stringify(LOCAL));
    firestore.setDoc.mockReset().mockResolvedValue(undefined);
  });

  it("moves pre-account data into an empty account, then clears it from the device", async () => {
    const { onState } = watch();
    firestore.emit(snap(undefined));
    await flush();

    expect(onState.mock.calls[0][0].cats[0].name).toBe("Food");
    expect(firestore.setDoc.mock.calls[0][1].cats[0].name).toBe("Food");
    expect(store.has("wallets_v1")).toBe(false);
  });

  it("never overwrites an account that already has data", async () => {
    const { onState } = watch();
    firestore.emit(snap(CLOUD));
    await flush();

    expect(onState.mock.calls[0][0].cats[0].name).toBe("Rent");
    expect(firestore.setDoc).not.toHaveBeenCalled();
    expect(store.has("wallets_v1")).toBe(true);
  });

  it("waits for the server when the offline cache hasn't seen the account", async () => {
    // Offline, a fresh device can't tell an empty account from an unsynced one.
    const { onState } = watch();
    firestore.emit(snap(undefined, { fromCache: true }));
    await flush();

    expect(onState).not.toHaveBeenCalled();
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });

  it("keeps the device's data when the upload fails", async () => {
    firestore.setDoc.mockRejectedValue(new Error("permission-denied"));
    const { onError } = watch();
    firestore.emit(snap(undefined));
    await flush();

    expect(onError).toHaveBeenCalled();
    expect(store.has("wallets_v1")).toBe(true);
  });
});
