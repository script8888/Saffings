import { describe, expect, it } from "vitest";
import { monthCsv } from "./csv";
import type { Wallet } from "../types";

function wallet(
  name: string,
  tx: Array<{ date: number; amt: number; note?: string }>,
  budget = 0,
): Wallet {
  return {
    id: name,
    name,
    budget,
    color: "#14654B",
    settledAt: 0,
    tx: tx.map((t, i) => ({ id: `${name}${i}`, note: "", ...t })),
  };
}

describe("monthCsv", () => {
  it("lists every wallet's records oldest first, so rows line up with a statement", () => {
    // Wallets store newest first; the export must not keep that order.
    const csv = monthCsv([
      wallet("Food", [{ date: new Date(2026, 8, 20, 18, 5).getTime(), amt: 4500 }], 80000),
      wallet(
        "Fuel",
        [
          { date: new Date(2026, 8, 22, 9, 0).getTime(), amt: 30000 },
          { date: new Date(2026, 8, 3, 7, 30).getTime(), amt: 25000 },
        ],
        50000,
      ),
    ]);

    expect(csv.split("\r\n")).toEqual([
      "Date,Time,Category,Note,Amount",
      "2026-09-03,07:30,Fuel,,25000",
      "2026-09-20,18:05,Food,,4500",
      "2026-09-22,09:00,Fuel,,30000",
      "",
      // Budget across every wallet, not spend, so overspend is total spent minus this.
      ",,,Total budget,130000",
    ]);
  });

  it("quotes notes with commas or quotes so they stay in one column", () => {
    const csv = monthCsv([
      wallet("Food", [
        { date: new Date(2026, 8, 1).getTime(), amt: 1200, note: 'rice, beans "big"' },
      ]),
    ]);

    expect(csv.split("\r\n")[1]).toBe('2026-09-01,00:00,Food,"rice, beans ""big""",1200');
  });
});
