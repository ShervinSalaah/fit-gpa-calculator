'use client';

import { useEffect } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  toast,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto animate-fade-in"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${
          isSuccess
            ? 'bg-white/95 dark:bg-slate-900/95 border-fuchsia-300 dark:border-fuchsia-700 text-gray-800 dark:text-gray-100'
            : 'bg-white/95 dark:bg-slate-900/95 border-red-300 dark:border-red-700 text-gray-800 dark:text-gray-100'
        }`}
      >
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            isSuccess ? 'bg-fuchsia-600' : 'bg-red-600'
          }`}
        >
          {isSuccess ? '✓' : '!'}
        </span>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}