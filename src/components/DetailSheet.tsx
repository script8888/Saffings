import type { Transaction, Wallet } from "../types";
import { formatNaira, formatSigned, formatTxDate } from "../lib/format";
import { leftOf, spentSince, weekWindowStart } from "../lib/wallet";
import { Sheet, SheetHeading } from "./Sheet";
import { GhostButton, PrimaryButton } from "./ui";

type Props = {
  wallet: Wallet;
  weekStart: number;
  onClose: () => void;
  onSpend: () => void;
  onEdit: () => void;
  onMarkWithdrawn: () => void;
  onDeleteTx: (txId: string) => void;
};

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex-1 rounded-[14px] border border-line bg-card px-3.5 py-3">
      <div className="text-xs font-bold text-muted">{label}</div>
      <div className={`mt-[3px] text-[19px] font-extrabold tracking-[-0.01em] ${className}`}>
        {value}
      </div>
    </div>
  );
}

export function DetailSheet({
  wallet,
  weekStart,
  onClose,
  onSpend,
  onEdit,
  onMarkWithdrawn,
  onDeleteTx,
}: Props) {
  const left = leftOf(wallet);
  const count = wallet.tx.length;
  const windowStart = weekWindowStart(wallet, weekStart);
  const thisWeek = spentSince(wallet, windowStart);
  const inWeek = wallet.tx.filter((t) => t.date >= windowStart);
  const earlier = wallet.tx.filter((t) => t.date < windowStart);

  function row(t: Transaction) {
    return (
      <li
        key={t.id}
        className="flex items-center gap-3 border-b border-line px-0.5 py-[13px] text-[15px] last:border-b-0"
      >
        <span>
          {t.note && (
            <>
              <span className="font-semibold text-muted">{t.note}</span>
              <br />
            </>
          )}
          <span className="text-xs font-semibold text-muted">{formatTxDate(t.date)}</span>
        </span>
        <span className="ml-auto font-extrabold">{formatNaira(t.amt)}</span>
        <button
          type="button"
          aria-label="Delete record"
          onClick={() => {
            if (confirm(`Delete this ${formatNaira(t.amt)} record? This can't be undone.`)) {
              onDeleteTx(t.id);
            }
          }}
          className="flex-none px-2 py-1 text-xl font-bold text-danger"
        >
          ×
        </button>
      </li>
    );
  }

  return (
    <Sheet onClose={onClose}>
      <SheetHeading
        title={wallet.name}
        sub={`${count} record${count === 1 ? "" : "s"} this month`}
      />

      <div className="my-4 flex gap-2.5">
        <Stat label="Budget" value={formatNaira(wallet.budget)} />
        <Stat label="This week" value={formatNaira(thisWeek)} />
        <Stat
          label="Left"
          value={formatSigned(left)}
          className={left < 0 ? "text-danger" : "text-ink"}
        />
      </div>

      <PrimaryButton onClick={onSpend}>Record spending</PrimaryButton>
      <GhostButton onClick={onEdit}>Edit budget / name</GhostButton>
      <GhostButton
        onClick={() => {
          if (
            confirm(
              `Mark ${formatNaira(thisWeek)} as withdrawn from ${wallet.name}? This week restarts at ₦0. No records are deleted.`,
            )
          ) {
            onMarkWithdrawn();
          }
        }}
      >
        Mark withdrawn
      </GhostButton>
      {wallet.settledAt > 0 && (
        <div className="mt-1.5 text-center text-xs font-semibold text-muted">
          Last withdrawn {formatTxDate(wallet.settledAt)}
        </div>
      )}

      {count === 0 ? (
        <div className="py-6 text-center text-sm font-semibold text-muted">
          No spending recorded yet.
        </div>
      ) : (
        <>
          <ul className="mt-2 list-none p-0">{inWeek.map(row)}</ul>
          {earlier.length > 0 && (
            <>
              <div className="mt-4 mb-1 text-xs font-bold tracking-[0.04em] text-muted uppercase">
                Earlier
              </div>
              <ul className="list-none p-0 opacity-60">{earlier.map(row)}</ul>
            </>
          )}
        </>
      )}

      <GhostButton className="mt-3.5" onClick={onClose}>
        Close
      </GhostButton>
    </Sheet>
  );
}
