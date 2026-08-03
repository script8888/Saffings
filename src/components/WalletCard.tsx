import type { Wallet } from "../types";
import { formatNaira } from "../lib/format";
import { barColorOf, barPctOf, leftOf } from "../lib/wallet";

type Props = {
  wallet: Wallet;
  onClick: () => void;
};

export function WalletCard({ wallet, onClick }: Props) {
  const left = leftOf(wallet);
  const over = left < 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-card border border-line bg-card px-[18px] py-4 text-left shadow-soft transition-transform duration-75 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <span
          className="size-3 flex-none rounded-full"
          style={{ background: wallet.color }}
        />
        <span className="text-lg font-extrabold tracking-[-0.01em]">{wallet.name}</span>
        <span className="ml-auto text-right">
          <span
            className={`block text-xl leading-none font-extrabold tracking-[-0.01em] ${
              over ? "text-danger" : ""
            }`}
          >
            {over ? "-" + formatNaira(Math.abs(left)) : formatNaira(left)}
          </span>
          <span className="mt-[3px] block text-xs font-semibold text-muted">
            {over ? "over budget" : "of " + formatNaira(wallet.budget)}
          </span>
        </span>
      </div>

      <div className="mt-[13px] h-2 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${barPctOf(wallet)}%`, background: barColorOf(wallet) }}
        />
      </div>
    </button>
  );
}
