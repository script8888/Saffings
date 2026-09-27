import { useRef, useState } from "react";
import { useWallets } from "./hooks/useWallets";
import { WalletCard } from "./components/WalletCard";
import { SpendSheet } from "./components/SpendSheet";
import { CategorySheet } from "./components/CategorySheet";
import { DetailSheet } from "./components/DetailSheet";
import { currentMonth, formatSigned } from "./lib/format";
import { COLORS, DAY_NAMES, totals } from "./lib/wallet";
import { normalizeState } from "./lib/storage";
import { monthCsv } from "./lib/csv";

type SheetState =
  | { kind: "none" }
  | { kind: "spend"; walletId: string }
  | { kind: "detail"; walletId: string }
  | { kind: "category"; walletId: string | null };

const FOOTER_BUTTON =
  "flex-1 rounded-[14px] border border-line bg-card p-[13px] text-sm font-bold text-ink-2 active:bg-sand-press";

export default function App() {
  const wallets = useWallets();
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" });
  const fileInput = useRef<HTMLInputElement>(null);

  const { state } = wallets;
  const close = () => setSheet({ kind: "none" });

  const activeId = sheet.kind === "none" ? null : sheet.walletId;
  const activeWallet = state.cats.find((w) => w.id === activeId) ?? null;
  const left = totals(state.cats).left;

  function download(filename: string, text: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const today = () => new Date().toISOString().slice(0, 10);

  function backUp() {
    download(`wallets-backup-${today()}.json`, JSON.stringify(state, null, 2), "application/json");
  }

  function exportCsv() {
    if (!state.cats.some((w) => w.tx.length > 0)) {
      alert("No spending recorded this month yet.");
      return;
    }
    // The BOM makes Excel read the file as UTF-8, so non-ASCII notes survive.
    download(`wallets-log-${today()}.csv`, "﻿" + monthCsv(state.cats), "text/csv");
  }

  function restore(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed = null;
      try {
        parsed = normalizeState(JSON.parse(String(reader.result)));
      } catch {
        parsed = null;
      }

      if (!parsed) {
        alert("That file couldn't be read as a backup.");
        return;
      }
      if (confirm("Restore this backup? It replaces everything currently in the app.")) {
        wallets.replaceState(parsed);
        close();
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-[620px] px-[18px] pt-[22px] pb-10">
      <header className="mb-1.5 flex items-baseline justify-between">
        <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em]">Wallets</h1>
        <span className="text-sm font-semibold text-muted">
          {state.month || currentMonth()}
        </span>
      </header>

      <div className="mt-3.5 mb-[22px] flex items-baseline gap-2.5 rounded-card bg-ink px-[18px] py-4 shadow-soft">
        <span className="text-[13px] font-semibold tracking-[0.02em] text-on-ink-muted">
          Left this month
        </span>
        <span
          className={`ml-auto text-2xl font-extrabold tracking-[-0.01em] ${
            left < 0 ? "text-on-ink-danger" : "text-on-ink"
          }`}
        >
          {formatSigned(left)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {state.cats.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            weekStart={state.weekStart}
            onClick={() => setSheet({ kind: "detail", walletId: wallet.id })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSheet({ kind: "category", walletId: null })}
        className="mt-3.5 w-full rounded-card border-[1.5px] border-dashed border-line p-[15px] text-base font-bold text-ink-2 active:bg-sand-press"
      >
        + Add category
      </button>

      <div className="mt-[22px] flex gap-2.5">
        <button
          type="button"
          className={FOOTER_BUTTON}
          onClick={() => {
            const ok = confirm(
              "Start a new month? This clears all spending records but keeps your wallets and budgets. Back up first if you want to keep this month's records.",
            );
            if (ok) wallets.startNewMonth();
          }}
        >
          New month
        </button>
        <button type="button" className={FOOTER_BUTTON} onClick={backUp}>
          Back up
        </button>
        <button
          type="button"
          className={FOOTER_BUTTON}
          onClick={() => fileInput.current?.click()}
        >
          Restore
        </button>
      </div>
      <button type="button" className={`${FOOTER_BUTTON} mt-2.5 w-full`} onClick={exportCsv}>
        Export month as CSV
      </button>

      <label className="mt-3.5 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
        Week starts on
        <select
          value={state.weekStart}
          onChange={(e) => wallets.setWeekStart(Number(e.target.value))}
          className="rounded-lg border border-line bg-card px-2 py-1 font-bold text-ink-2"
        >
          {DAY_NAMES.map((day, i) => (
            <option key={day} value={i}>
              {day}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-4 px-5 text-center text-xs leading-relaxed text-muted">
        Tap a wallet to record spending. Data is saved on this phone only — back up now
        and then so you don't lose it.
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) restore(file);
          e.target.value = "";
        }}
      />

      {sheet.kind === "spend" && activeWallet && (
        <SpendSheet
          wallet={activeWallet}
          onClose={close}
          onSave={(amount, note) => {
            wallets.addTransaction(activeWallet.id, amount, note);
            close();
          }}
        />
      )}

      {sheet.kind === "detail" && activeWallet && (
        <DetailSheet
          wallet={activeWallet}
          weekStart={state.weekStart}
          onClose={close}
          onSpend={() => setSheet({ kind: "spend", walletId: activeWallet.id })}
          onEdit={() => setSheet({ kind: "category", walletId: activeWallet.id })}
          onMarkWithdrawn={() => wallets.markWithdrawn(activeWallet.id)}
          onDeleteTx={(txId) => wallets.deleteTransaction(activeWallet.id, txId)}
        />
      )}

      {sheet.kind === "category" && (
        <CategorySheet
          wallet={activeWallet}
          suggestedColor={COLORS[state.cats.length % COLORS.length]}
          onClose={close}
          onSave={(draft) => {
            if (activeWallet) wallets.updateWallet(activeWallet.id, draft);
            else wallets.addWallet(draft);
            close();
          }}
          onDelete={() => {
            if (!activeWallet) return;
            if (confirm(`Delete "${activeWallet.name}" and all its records?`)) {
              wallets.deleteWallet(activeWallet.id);
              close();
            }
          }}
        />
      )}
    </div>
  );
}
