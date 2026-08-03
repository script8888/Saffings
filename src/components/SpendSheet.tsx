import { useState } from "react";
import type { Wallet } from "../types";
import { formatNaira, formatNumber } from "../lib/format";
import { leftOf } from "../lib/wallet";
import { applyKey } from "../lib/amount";
import { Sheet, SheetHeading } from "./Sheet";
import { Keypad } from "./Keypad";
import { Field, GhostButton, PrimaryButton, TextInput } from "./ui";

type Props = {
  wallet: Wallet;
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
};

export function SpendSheet({ wallet, onClose, onSave }: Props) {
  const [digits, setDigits] = useState("");
  const [note, setNote] = useState("");

  const amount = digits === "" ? 0 : parseInt(digits, 10);

  return (
    <Sheet onClose={onClose}>
      <SheetHeading
        title={wallet.name}
        sub={`${formatNaira(leftOf(wallet))} left in this wallet`}
      />

      <div
        className={`min-h-16 pt-3.5 pb-1.5 text-center text-[46px] font-extrabold tracking-[-0.02em] ${
          amount === 0 ? "text-line" : "text-ink"
        }`}
      >
        <span className={amount === 0 ? "" : "font-bold text-muted"}>₦</span>
        {formatNumber(amount)}
      </div>

      <div className="mt-2">
        <Field>
          <TextInput
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional) — e.g. suya, bolt ride"
            autoComplete="off"
          />
        </Field>
      </div>

      <Keypad onKey={(key) => setDigits((d) => applyKey(d, key))} />

      <PrimaryButton
        disabled={amount <= 0}
        onClick={() => onSave(amount, note.trim())}
      >
        Save spending
      </PrimaryButton>
      <GhostButton onClick={onClose}>Cancel</GhostButton>
    </Sheet>
  );
}
