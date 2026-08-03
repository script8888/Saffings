import { useState } from "react";
import type { Wallet, WalletDraft } from "../types";
import { COLORS } from "../lib/wallet";
import { Sheet, SheetHeading } from "./Sheet";
import { DangerButton, Field, GhostButton, PrimaryButton, TextInput } from "./ui";

type Props = {
  /** null when adding a new wallet. */
  wallet: Wallet | null;
  /** Colour offered to a brand-new wallet, so consecutive adds differ. */
  suggestedColor: string;
  onClose: () => void;
  onSave: (draft: WalletDraft) => void;
  onDelete: () => void;
};

export function CategorySheet({
  wallet,
  suggestedColor,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [budget, setBudget] = useState(wallet && wallet.budget ? String(wallet.budget) : "");
  const [color, setColor] = useState(wallet?.color ?? suggestedColor);

  const trimmed = name.trim();

  return (
    <Sheet onClose={onClose}>
      <SheetHeading
        title={wallet ? "Edit wallet" : "Add category"}
        sub={
          wallet
            ? "Change the name, budget or colour."
            : "Set a monthly budget for this wallet."
        }
      />

      <Field label="Name">
        <TextInput
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Food"
          autoComplete="off"
        />
      </Field>

      <Field label="Monthly budget (₦)">
        <TextInput
          type="number"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="0"
        />
      </Field>

      <Field label="Colour">
        <div className="mt-1 flex flex-wrap gap-2.5">
          {COLORS.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={`Colour ${option}`}
              onClick={() => setColor(option)}
              className={`size-[38px] rounded-full border-[3px] ${
                option === color ? "border-ink" : "border-transparent"
              }`}
              style={{ background: option }}
            />
          ))}
        </div>
      </Field>

      <PrimaryButton
        disabled={!trimmed}
        onClick={() =>
          onSave({
            name: trimmed,
            budget: parseInt(budget || "0", 10) || 0,
            color,
          })
        }
      >
        Save
      </PrimaryButton>

      {wallet && <DangerButton onClick={onDelete}>Delete this wallet</DangerButton>}
      <GhostButton onClick={onClose}>Cancel</GhostButton>
    </Sheet>
  );
}
