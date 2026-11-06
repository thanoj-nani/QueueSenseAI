import React from 'react';
import { useQueue } from '../context/QueueContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { notifications } = useQueue();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-300'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="mr-3 mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
