import type { Wallet } from "../types";
import { formatNaira, formatSigned, formatTxDate } from "../lib/format";
import { leftOf, spentOf } from "../lib/wallet";
import { Sheet, SheetHeading } from "./Sheet";
import { GhostButton, PrimaryButton } from "./ui";

type Props = {
  wallet: Wallet;
  onClose: () => void;
  onSpend: () => void;
  onEdit: () => void;
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

export function DetailSheet({ wallet, onClose, onSpend, onEdit, onDeleteTx }: Props) {
  const spent = spentOf(wallet);
  const left = leftOf(wallet);
  const count = wallet.tx.length;

  return (
    <Sheet onClose={onClose}>
      <SheetHeading
        title={wallet.name}
        sub={`${count} record${count === 1 ? "" : "s"} this month`}
      />

      <div className="my-4 flex gap-2.5">
        <Stat label="Budget" value={formatNaira(wallet.budget)} />
        <Stat label="Spent" value={formatNaira(spent)} />
        <Stat
          label="Left"
          value={formatSigned(left)}
          className={left < 0 ? "text-danger" : "text-ink"}
        />
      </div>

      <PrimaryButton onClick={onSpend}>Record spending</PrimaryButton>
      <GhostButton onClick={onEdit}>Edit budget / name</GhostButton>

      {count === 0 ? (
        <div className="py-6 text-center text-sm font-semibold text-muted">
          No spending recorded yet.
        </div>
      ) : (
        <ul className="mt-2 list-none p-0">
          {wallet.tx.map((t) => (
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
                <span className="text-xs font-semibold text-muted">
                  {formatTxDate(t.date)}
                </span>
              </span>
              <span className="ml-auto font-extrabold">{formatNaira(t.amt)}</span>
              <button
                type="button"
                aria-label="Delete record"
                onClick={() => onDeleteTx(t.id)}
                className="flex-none px-2 py-1 text-xl font-bold text-danger"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <GhostButton className="mt-3.5" onClick={onClose}>
        Close
      </GhostButton>
    </Sheet>
  );
}
