"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        {description ? <p className="text-sm text-neutral-400 mb-4">{description}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-neutral-900/60 hover:bg-neutral-900"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
