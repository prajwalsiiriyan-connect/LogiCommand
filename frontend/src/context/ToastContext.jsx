import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type, duration }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = {
    success: (m, d) => addToast(m, 'success', d),
    error:   (m, d) => addToast(m, 'error',   d),
    warning: (m, d) => addToast(m, 'warning', d),
    info:    (m, d) => addToast(m, 'info',    d),
  };

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error:   <XCircle     size={18} className="text-red-500"   />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info:    <Info         size={18} className="text-blue-500"  />,
  };
  const borders = {
    success: 'border-l-green-500',
    error:   'border-l-red-500',
    warning: 'border-l-amber-500',
    info:    'border-l-blue-500',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto toast-enter flex items-start gap-3 bg-white shadow-modal rounded-xl px-4 py-3
                        border border-slate-100 border-l-4 ${borders[t.type]} min-w-[300px] max-w-[420px]`}
          >
            <span className="mt-0.5 flex-shrink-0">{icons[t.type]}</span>
            <p className="text-sm text-slate-700 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
