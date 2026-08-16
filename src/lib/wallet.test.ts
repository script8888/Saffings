import { describe, expect, it } from "vitest";
import { spentSince, startOfWeek, weekWindowStart } from "./wallet";
import { normalizeState } from "./storage";
import type { Wallet } from "../types";

/** Local-time constructor, so these assertions hold in any timezone. */
function at(y: number, m: number, d: number, h = 12): number {
  return new Date(y, m - 1, d, h).getTime();
}

function expectDay(ts: number, y: number, m: number, d: number) {
  const got = new Date(ts);
  expect([got.getFullYear(), got.getMonth() + 1, got.getDate()]).toEqual([y, m, d]);
  expect([got.getHours(), got.getMinutes(), got.getSeconds()]).toEqual([0, 0, 0]);
}

function walletWith(tx: Array<{ date: number; amt: number }>, settledAt = 0): Wallet {
  return {
    id: "w",
    name: "Food",
    budget: 80000,
    color: "#14654B",
    settledAt,
    tx: tx.map((t, i) => ({ id: String(i), note: "", ...t })),
  };
}

// 2026-08-12 is a Wednesday.
const wednesday = at(2026, 8, 12);

describe("startOfWeek", () => {
  it("walks back to the most recent start day", () => {
    expectDay(startOfWeek(0, wednesday), 2026, 8, 9); // Sunday
    expectDay(startOfWeek(1, wednesday), 2026, 8, 10); // Monday
    expectDay(startOfWeek(3, wednesday), 2026, 8, 12); // today, it is Wednesday
    expectDay(startOfWeek(4, wednesday), 2026, 8, 6); // Thursday, a full week back
    expectDay(startOfWeek(6, wednesday), 2026, 8, 8); // Saturday
  });

  it("returns midnight of the same day when today is the start day", () => {
    expectDay(startOfWeek(0, at(2026, 8, 9, 0)), 2026, 8, 9);
    expectDay(startOfWeek(0, at(2026, 8, 9, 23)), 2026, 8, 9);
  });

  it("crosses a month boundary", () => {
    // 2026-09-02 is a Wednesday; the Sunday before it is in August.
    expectDay(startOfWeek(0, at(2026, 9, 2)), 2026, 8, 30);
  });

  it("moves the boundary forward the instant the start day begins", () => {
    // Saturday 23:59 still belongs to the old week, Sunday 00:00 starts a new one.
    expectDay(startOfWeek(0, at(2026, 8, 15, 23)), 2026, 8, 9);
    expectDay(startOfWeek(0, at(2026, 8, 16, 0)), 2026, 8, 16);
  });
});

describe("spentSince", () => {
  it("counts from the boundary inclusive and ignores anything before it", () => {
    const boundary = at(2026, 8, 9, 0);
    const w = walletWith([
      { date: at(2026, 8, 8, 20), amt: 5000 }, // last week
      { date: boundary, amt: 1000 }, // exactly on the boundary, counts
      { date: at(2026, 8, 11), amt: 2500 },
    ]);
    expect(spentSince(w, boundary)).toBe(3500);
  });

  it("is zero when nothing falls in the window", () => {
    expect(spentSince(walletWith([{ date: at(2026, 8, 1), amt: 900 }]), at(2026, 8, 9))).toBe(0);
  });
});

describe("weekWindowStart", () => {
  it("uses the calendar week when the wallet has never been settled", () => {
    expectDay(weekWindowStart(walletWith([]), 0, wednesday), 2026, 8, 9);
  });

  it("uses a mid-week settle, so the weekly figure restarts from that moment", () => {
    const settled = at(2026, 8, 11, 9);
    const w = walletWith(
      [
        { date: at(2026, 8, 10), amt: 4000 }, // before the settle
        { date: at(2026, 8, 11, 18), amt: 1500 }, // after it
      ],
      settled,
    );
    expect(weekWindowStart(w, 0, wednesday)).toBe(settled);
    expect(spentSince(w, weekWindowStart(w, 0, wednesday))).toBe(1500);
  });

  it("lets a stale settle expire once the next week begins", () => {
    const w = walletWith([], at(2026, 8, 5, 9));
    expectDay(weekWindowStart(w, 0, wednesday), 2026, 8, 9);
  });
});

// The normalizers rebuild fresh object literals, so a field that isn't listed
// there is silently dropped on the next load. This guards the upgrade path for
// anyone whose localStorage predates weekStart / settledAt.
const OLD_PAYLOAD = {
  month: "August 2026",
  cats: [
    {
      id: "a",
      name: "Food",
      budget: 80000,
      color: "#14654B",
      tx: [{ id: "t1", amt: 12400, note: "market", date: 1755000000000 }],
    },
  ],
};

describe("normalizeState", () => {
  it("keeps every field of a pre-weekly payload and backfills the new ones", () => {
    const s = normalizeState(structuredClone(OLD_PAYLOAD))!;
    expect(s.month).toBe("August 2026");
    expect(s.weekStart).toBe(0);
    expect(s.cats).toHaveLength(1);
    expect(s.cats[0]).toMatchObject({
      id: "a",
      name: "Food",
      budget: 80000,
      color: "#14654B",
      settledAt: 0,
    });
    expect(s.cats[0].tx).toEqual(OLD_PAYLOAD.cats[0].tx);
  });

  it("clamps a junk weekStart to Sunday and keeps a valid one", () => {
    for (const bad of [9, -1, 2.5, "1", null, undefined]) {
      expect(normalizeState({ ...OLD_PAYLOAD, weekStart: bad })!.weekStart).toBe(0);
    }
    expect(normalizeState({ ...OLD_PAYLOAD, weekStart: 6 })!.weekStart).toBe(6);
  });

  it("round-trips a settled wallet", () => {
    const s = normalizeState({
      ...OLD_PAYLOAD,
      weekStart: 1,
      cats: [{ ...OLD_PAYLOAD.cats[0], settledAt: 1755100000000 }],
    })!;
    expect(s.cats[0].settledAt).toBe(1755100000000);
  });
});
