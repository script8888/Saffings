import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`mt-2 w-full rounded-2xl bg-ink p-[18px] text-lg font-extrabold tracking-[0.01em] text-white active:bg-ink-2 disabled:bg-disabled ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`mt-1 w-full p-[15px] text-[15px] font-bold text-muted ${className}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`mt-2.5 w-full rounded-[14px] bg-danger-bg p-[15px] text-[15px] font-bold text-danger ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-[7px] block text-[13px] font-bold text-ink-2">{label}</label>
      )}
      {children}
    </div>
  );
}

export function TextInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-[14px] border-[1.5px] border-line bg-card px-4 py-[15px] text-lg font-semibold text-ink outline-none focus:border-ink-2 ${className}`}
    />
  );
}
