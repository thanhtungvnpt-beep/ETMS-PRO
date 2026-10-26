import React, { useEffect } from 'react';
import { CheckCircle2, X, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ToastMessage {
  id: string;
  step?: number;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  timestamp?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700/80 p-3.5 flex items-start gap-3 transition-all duration-200 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-2">
      {/* Icon or Step indicator */}
      <div className="mt-0.5 shrink-0">
        {toast.step ? (
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs border border-blue-400/40">
            {toast.step}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {toast.step && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
              Bước {toast.step}
            </span>
          )}
          <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
