'use client';

import { toast } from 'sonner';

type ToastOptions = {
  description?: string;
};

function normalizeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Terjadi kesalahan.';
  }
}

/**
 * Admin-only toast helpers.
 *
 * Convention:
 * - success: operasi berhasil
 * - error: operasi gagal
 * - info: informasi umum
 */
export const adminToast = {
  success(title: string, options?: ToastOptions) {
    toast.success(title, { description: options?.description });
  },
  error(title: string, err?: unknown, options?: ToastOptions) {
    const msg = err ? normalizeError(err) : undefined;
    toast.error(title, {
      description: options?.description ?? msg,
    });
  },
  info(title: string, options?: ToastOptions) {
    toast(title, { description: options?.description });
  },
};
