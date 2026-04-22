"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger" | "teal";
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ActionPopup({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  pending = false,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-ink/55 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        {description ? <p className="mt-2 text-sm text-ink/75">{description}</p> : null}

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {cancelLabel ? (
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-full border border-line px-4 py-2 text-xs tracking-label text-ink/80 disabled:opacity-40"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "rounded-full px-4 py-2 text-xs tracking-label disabled:opacity-40",
              tone === "danger" && "bg-rose/80 text-ink hover:bg-rose",
              tone === "teal" && "bg-teal text-white hover:bg-deep-ocean",
              tone === "default" && "bg-ink text-bg hover:bg-deep-ocean",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
