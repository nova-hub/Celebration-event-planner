import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const typeConfig = {
    success: {
      border: 'border-emerald-500/40 bg-zinc-950/95 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      accentBar: 'bg-emerald-500'
    },
    error: {
      border: 'border-rose-500/40 bg-zinc-950/95 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      accentBar: 'bg-rose-500'
    },
    info: {
      border: 'border-purple-500/40 bg-zinc-950/95 text-purple-200',
      icon: <Info className="w-5 h-5 text-purple-400 shrink-0" />,
      accentBar: 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  };

  const style = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300 ${style.border}`}
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${style.accentBar}`} />
      {style.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed pl-1">
        {toast.message}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-white transition-colors p-0.5 rounded-md hover:bg-zinc-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
