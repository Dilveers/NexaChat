"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";

type ConfirmToastOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

function messageText(message: unknown, fallback: string) {
  if (message instanceof Error && message.message) {
    return message.message;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
}

export const notify = {
  success(message: ReactNode) {
    return toast.success(message);
  },
  error(message: unknown, fallback = "Something went wrong") {
    return toast.error(messageText(message, fallback));
  },
  info(message: ReactNode) {
    return toast.info(message);
  },
  loading(message: ReactNode) {
    return toast.loading(message);
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};

export function confirmToast({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ConfirmToastOptions) {
  return new Promise<boolean>((resolve) => {
    toast.custom(
      (toastId) => (
        <div className="w-[min(92vw,360px)] rounded-2xl border border-white/15 bg-indigo-950/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-white/70">{description}</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              onClick={() => {
                toast.dismiss(toastId);
                resolve(false);
              }}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${
                danger
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-indigo-500 hover:bg-indigo-400"
              }`}
              onClick={() => {
                toast.dismiss(toastId);
                resolve(true);
              }}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}

