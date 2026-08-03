const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"];

type Props = {
  onKey: (key: string) => void;
};

export function Keypad({ onKey }: Props) {
  return (
    <div className="my-1.5 grid grid-cols-3 gap-2.5">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          className={`select-none rounded-2xl border border-line bg-card py-[18px] font-bold active:scale-[0.97] active:bg-key-press ${
            key === "⌫" ? "text-[22px] text-danger" : "text-[26px] text-ink"
          }`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
