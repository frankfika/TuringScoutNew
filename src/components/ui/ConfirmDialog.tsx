import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // focus the cancel button by default
    requestAnimationFrame(() => {
      const btn = dialogRef.current?.querySelector<HTMLButtonElement>("button[data-cancel]");
      btn?.focus();
    });
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="bg-white border border-[#141414] rounded-md shadow-[6px_6px_0_0_#141414] w-full max-w-md p-6 flex flex-col gap-4"
      >
        <h2 id="confirm-dialog-title" className="font-serif font-bold text-xl text-[#141414]">
          {title}
        </h2>
        {message && (
          <p className="font-sans text-sm leading-relaxed text-[#333]">{message}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            data-cancel
            onClick={onCancel}
            className="bg-white border border-[#141414] px-4 py-2 text-[11px] uppercase tracking-widest font-bold rounded-sm hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-[11px] uppercase tracking-widest font-bold rounded-sm border border-[#141414] shadow-[2px_2px_0_0_#141414] active:translate-y-0.5 active:shadow-none ${
              destructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
