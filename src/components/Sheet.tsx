import { useEffect, type ReactNode } from "react";

type Props = {
  onClose: () => void;
  children: ReactNode;
};

/** Bottom sheet. Mounting it opens it, so unmounting resets any inner state. */
export function Sheet({ onClose, children }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[94vh] w-full max-w-[620px] animate-rise overflow-y-auto rounded-t-sheet bg-sand px-[18px] pt-2.5 pb-[calc(18px+env(safe-area-inset-bottom))] shadow-sheet">
        <div className="mx-auto mt-1.5 mb-3.5 h-[5px] w-[42px] rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

export function SheetHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h2 className="m-0 mb-1 text-[21px] font-extrabold tracking-[-0.01em]">{title}</h2>
      <p className="m-0 mb-[18px] text-sm font-semibold text-muted">{sub}</p>
    </>
  );
}
